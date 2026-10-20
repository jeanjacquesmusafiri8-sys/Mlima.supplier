import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  LoaderCircle,
  Upload,
  X,
} from 'lucide-react';
import JSZip from 'jszip';
import { readSheet } from 'read-excel-file/browser';
import { Category, Product, StockStatus } from '../../types';

const IMPORT_COLUMNS = [
  'Référence SKU *',
  'Nom du produit *',
  'Catégorie *',
  'Sous-catégorie',
  'Prix USD',
  'Sur devis',
  'Unité',
  'Quantité minimale',
  'Stock',
  'Statut du stock',
  'Mis en avant',
  'Nouveau',
  'Actif',
  'Accessible aux clients',
  'Images (URLs séparées par |)',
  'Description courte',
  'Description détaillée',
  'Spécifications (JSON)',
] as const;

type ImportField =
  | 'sku'
  | 'name'
  | 'category'
  | 'subcategory'
  | 'priceUSD'
  | 'isQuoteOnly'
  | 'unit'
  | 'minOrderQuantity'
  | 'stockQuantity'
  | 'stockStatus'
  | 'isFeatured'
  | 'isNew'
  | 'isActive'
  | 'isPublic'
  | 'imageUrls'
  | 'shortDesc'
  | 'description'
  | 'specifications';

const COLUMN_FIELDS: Record<string, ImportField> = {
  'reference sku': 'sku',
  'nom du produit': 'name',
  categorie: 'category',
  'sous categorie': 'subcategory',
  'prix usd': 'priceUSD',
  'sur devis': 'isQuoteOnly',
  unite: 'unit',
  'quantite minimale': 'minOrderQuantity',
  stock: 'stockQuantity',
  'statut du stock': 'stockStatus',
  'mis en avant': 'isFeatured',
  nouveau: 'isNew',
  actif: 'isActive',
  'accessible aux clients': 'isPublic',
  'images urls separees par': 'imageUrls',
  'description courte': 'shortDesc',
  'description detaillee': 'description',
  'specifications json': 'specifications',
};

interface LocalImage {
  filename: string;
  blob: Blob;
  previewUrl: string;
  uploadedUrl?: string;
}

interface ImportedProduct extends Partial<Product> {
  sku: string;
  name: string;
  categoryId: string;
  slug: string;
  stockQuantity: number;
  stockStatus: StockStatus;
  images: string[];
  localImages: LocalImage[];
  rowNumber: number;
  errors: string[];
}

interface ProductImportModalProps {
  isOpen: boolean;
  categories: Category[];
  products: Product[];
  onClose: () => void;
  onImportProducts: (products: Partial<Product>[]) => Promise<void>;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const toCellString = (value: unknown) =>
  value === null || value === undefined ? '' : String(value).trim();

const parseBoolean = (value: unknown, defaultValue: boolean) => {
  const normalized = normalize(toCellString(value));
  if (!normalized) return defaultValue;
  if (['oui', 'true', '1', 'yes'].includes(normalized)) return true;
  if (['non', 'false', '0', 'no'].includes(normalized)) return false;
  return null;
};

const parseNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const text = toCellString(value).replace(/\s/g, '');
  if (!text) return null;
  const normalized =
    text.includes(',') && !text.includes('.')
      ? text.replace(',', '.')
      : text;
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const makeSlug = (name: string, sku: string) => {
  const namePart = normalize(name).replace(/\s+/g, '-').slice(0, 139) || 'produit';
  const skuPart = normalize(sku).replace(/\s+/g, '-').slice(0, 80);
  return `${namePart}-${skuPart}`;
};

const safeJsonSpecifications = (value: unknown) => {
  const text = toCellString(value);
  if (!text) return { data: {} as Record<string, string> };
  try {
    const parsed: unknown = JSON.parse(text);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed) ||
      Object.values(parsed).some(
        (item) =>
          item === null ||
          (typeof item !== 'string' &&
            typeof item !== 'number' &&
            typeof item !== 'boolean'),
      )
    ) {
      return { error: 'Les spécifications doivent être un objet JSON clé/valeur.' };
    }
    return {
      data: Object.fromEntries(
        Object.entries(parsed).map(([key, item]) => [key, String(item)]),
      ),
    };
  } catch {
    return { error: 'Le JSON des spécifications est invalide.' };
  }
};

const escapeXml = (value: string) =>
  value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const columnName = (index: number) => {
  let value = index + 1;
  let name = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
};

const worksheetXml = (rows: unknown[][], widths: number[]) => {
  const maxColumns = Math.max(1, ...rows.map((row) => row.length));
  const maxRows = Math.max(1, rows.length);
  const cells = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const content = row
        .map((value, columnIndex) => {
          if (value === null || value === undefined || value === '') return '';
          const reference = `${columnName(columnIndex)}${rowNumber}`;
          if (typeof value === 'number' && Number.isFinite(value)) {
            return `<c r="${reference}"><v>${value}</v></c>`;
          }
          if (typeof value === 'boolean') {
            return `<c r="${reference}" t="b"><v>${value ? 1 : 0}</v></c>`;
          }
          return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`;
        })
        .join('');
      return `<row r="${rowNumber}">${content}</row>`;
    })
    .join('');
  const columnWidths = widths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${columnName(maxColumns - 1)}${maxRows}"/><sheetViews><sheetView workbookViewId="0"/></sheetViews><cols>${columnWidths}</cols><sheetData>${cells}</sheetData></worksheet>`;
};

const downloadTemplate = async (categories: Category[]) => {
  const examples = [
    [
      'EXEMPLE-001',
      'Exemple à remplacer - Produit A',
      categories[0]?.name || '',
      '',
      25.5,
      'non',
      'Pièce',
      1,
      10,
      'IN_STOCK',
      'non',
      'oui',
      'oui',
      'oui',
      'https://exemple.org/produit-a.jpg',
      'Courte description du produit',
      'Description détaillée du produit',
      '{"Marque":"Exemple","Couleur":"Noir"}',
    ],
    [
      'EXEMPLE-002',
      'Exemple à remplacer - Produit B',
      categories[0]?.name || '',
      categories[0]?.subcategories[0]?.name || '',
      '',
      'oui',
      'Carton',
      5,
      0,
      'ON_ORDER',
      'non',
      'non',
      'oui',
      'non',
      '',
      '',
      'Produit disponible sur devis.',
      '{}',
    ],
  ];
  const instructions = [
    ['IMPORT DE PRODUITS - MLIMA SUPPLIER'],
    ['Supprimez les deux lignes EXEMPLE avant l’importation, puis ajoutez une ligne par produit.'],
    ['Champs obligatoires : Référence SKU, Nom du produit et Catégorie. Les en-têtes doivent rester présents.'],
    ['Prix : montant numérique en USD, par exemple 125.50. Laissez vide pour un prix non défini.'],
    ['Quantités : nombres entiers positifs ou nuls. Quantité minimale : entier supérieur ou égal à 1.'],
    ['Catégorie et sous-catégorie : utilisez exactement un des noms ci-dessous. La sous-catégorie doit appartenir à la catégorie choisie.'],
    ['Statut du stock : IN_STOCK, LOW_STOCK, OUT_OF_STOCK ou ON_ORDER.'],
    ['Valeurs oui/non : utilisez oui ou non pour Sur devis, Mis en avant, Nouveau, Actif et Accessible aux clients.'],
    ['Images par URL : collez une ou plusieurs URLs HTTP(S), séparées par |. Maximum 12 images par produit.'],
    ['Images locales : créez un ZIP avec ce classeur et des images nommées SKU__01.jpg, SKU__02.png, etc. Le SKU avant __ doit correspondre exactement à la colonne Référence SKU.'],
    ['Spécifications : objet JSON clé/valeur, par exemple {"Marque":"Kenwood","Puissance":"25 W"}.'],
    ['Les champs non renseignés gardent des valeurs par défaut sûres; les images d’un ZIP nécessitent le stockage Cloudinary configuré sur le serveur.'],
    ['Limite : 500 produits par importation. Pour un fichier plus grand, importez plusieurs fichiers.'],
    [],
    ['Catégories disponibles'],
    ['Catégorie', 'Sous-catégories'],
    ...categories.map((category) => [
      category.name,
      category.subcategories.map((subcategory) => subcategory.name).join(' | ') ||
        '(aucune)',
    ]),
  ];
  const zip = new JSZip();
  const relationshipNamespace =
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
  );
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${relationshipNamespace}"><Relationship Id="rId1" Type="${relationshipNamespace}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  );
  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${relationshipNamespace}"><sheets><sheet name="Produits" sheetId="1" r:id="rId1"/><sheet name="Instructions" sheetId="2" r:id="rId2"/></sheets></workbook>`,
  );
  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${relationshipNamespace}"><Relationship Id="rId1" Type="${relationshipNamespace}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${relationshipNamespace}/worksheet" Target="worksheets/sheet2.xml"/></Relationships>`,
  );
  zip.file(
    'xl/worksheets/sheet1.xml',
    worksheetXml(
      [[...IMPORT_COLUMNS], ...examples],
      IMPORT_COLUMNS.map((column) =>
        Math.min(Math.max(column.length + 3, 16), 38),
      ),
    ),
  );
  zip.file(
    'xl/worksheets/sheet2.xml',
    worksheetXml(instructions, [105, 70]),
  );
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'modele-import-produits-mlima.xlsx';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const parseCsv = (text: string): unknown[][] => {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delimiters = [',', ';', '\t'];
  let delimiter = ',';
  let highestCount = -1;
  for (const candidate of delimiters) {
    let count = 0;
    let quoted = false;
    for (let index = 0; index < firstLine.length; index += 1) {
      if (firstLine[index] === '"') {
        if (quoted && firstLine[index + 1] === '"') index += 1;
        else quoted = !quoted;
      } else if (!quoted && firstLine[index] === candidate) {
        count += 1;
      }
    }
    if (count > highestCount) {
      highestCount = count;
      delimiter = candidate;
    }
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && character === delimiter) {
      row.push(field);
      field = '';
    } else if (!quoted && (character === '\n' || character === '\r')) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error('Le fichier CSV contient un champ entre guillemets non terminé.');
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

const readWorkbook = async (file: File) => {
  const extension = file.name.toLowerCase().split('.').pop();
  if (!['xlsx', 'csv'].includes(extension || '')) {
    throw new Error('Sélectionnez un fichier .xlsx, .csv ou .zip.');
  }
  if (extension === 'csv') return parseCsv(await file.text());
  return readSheet(await file.arrayBuffer());
};

const readZipImport = async (file: File) => {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Le fichier ZIP ne peut pas dépasser 25 Mo.');
  }
  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files).filter(
    (entry) => !entry.dir && !entry.name.startsWith('__MACOSX/'),
  );
  const workbooks = entries.filter((entry) => /\.(xlsx|csv)$/i.test(entry.name));
  if (workbooks.length !== 1) {
    throw new Error('Le ZIP doit contenir un seul fichier .xlsx ou .csv.');
  }
  const workbookEntry = workbooks[0];
  const workbookBlob = await workbookEntry.async('blob');
  const workbookFile = new File([workbookBlob], workbookEntry.name);
  const rows = await readWorkbook(workbookFile);
  const imageEntries = entries.filter((entry) =>
    /\.(jpe?g|png|webp|gif)$/i.test(entry.name),
  );
  let totalImageSize = 0;
  const images: { name: string; blob: Blob }[] = [];
  for (const entry of imageEntries) {
    const content = await entry.async('blob');
    const blob = new Blob([content], { type: imageMimeType(entry.name) });
    totalImageSize += blob.size;
    if (blob.size > 8 * 1024 * 1024 || totalImageSize > 50 * 1024 * 1024) {
      throw new Error('Les images du ZIP dépassent la limite de taille autorisée.');
    }
    images.push({ name: entry.name, blob });
  }
  return { rows, images };
};

const imageMimeType = (filename: string) => {
  const extension = filename.toLowerCase().split('.').pop();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'gif') return 'image/gif';
  return '';
};

const asProductPayload = (product: ImportedProduct): Partial<Product> => {
  const { rowNumber: _rowNumber, errors: _errors, localImages: _localImages, ...data } =
    product;
  return data;
};

export const ProductImportModal: React.FC<ProductImportModalProps> = ({
  isOpen,
  categories,
  products,
  onClose,
  onImportProducts,
}) => {
  const [parsedProducts, setParsedProducts] = useState<ImportedProduct[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const previewUrls = useRef<string[]>([]);

  const clearPreviewUrls = () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current = [];
  };

  useEffect(
    () => () => {
      clearPreviewUrls();
    },
    [],
  );

  const parseRows = (
    rows: unknown[][],
    localImages: { name: string; blob: Blob }[] = [],
  ) => {
    if (rows.length < 2) throw new Error('Le fichier ne contient aucune ligne produit.');
    const headers = rows[0].map((header) => normalize(toCellString(header)));
    const fieldIndexes = new Map<ImportField, number>();
    headers.forEach((header, index) => {
      const field = COLUMN_FIELDS[header];
      if (field) {
        if (fieldIndexes.has(field)) {
          throw new Error(`La colonne « ${header} » apparaît plusieurs fois.`);
        }
        fieldIndexes.set(field, index);
      }
    });
    for (const field of ['sku', 'name', 'category'] as const) {
      if (!fieldIndexes.has(field)) {
        throw new Error(`La colonne obligatoire « ${field} » est manquante.`);
      }
    }

    const getCell = (row: unknown[], field: ImportField) =>
      toCellString(row[fieldIndexes.get(field) ?? -1]);
    const categoryLookup = new Map<string, Category[]>();
    categories.forEach((category) => {
      const key = normalize(category.name);
      categoryLookup.set(key, [...(categoryLookup.get(key) || []), category]);
    });
    const parsed: ImportedProduct[] = [];

    rows.slice(1).forEach((row, rowIndex) => {
      if (row.every((cell) => !toCellString(cell))) return;
      const rowNumber = rowIndex + 2;
      const sku = getCell(row, 'sku').toUpperCase();
      const name = getCell(row, 'name');
      const categoryName = getCell(row, 'category');
      const rowErrors: string[] = [];
      if (!sku) rowErrors.push('La référence SKU est obligatoire.');
      if (sku.length > 80) rowErrors.push('La référence SKU ne peut pas dépasser 80 caractères.');
      if (!name) rowErrors.push('Le nom du produit est obligatoire.');
      if (name.length > 200) rowErrors.push('Le nom du produit ne peut pas dépasser 200 caractères.');
      if (!categoryName) rowErrors.push('La catégorie est obligatoire.');
      const categoryMatches = categoryLookup.get(normalize(categoryName)) || [];
      if (categoryName && categoryMatches.length === 0) {
        rowErrors.push(`Catégorie inconnue : « ${categoryName} ».`);
      } else if (categoryMatches.length > 1) {
        rowErrors.push(`La catégorie « ${categoryName} » est ambiguë.`);
      }
      const category = categoryMatches[0];

      let subcategoryId: string | undefined;
      const subcategoryName = getCell(row, 'subcategory');
      if (subcategoryName && category) {
        const matchingSubcategories = category.subcategories.filter(
          (subcategory) =>
            normalize(subcategory.name) === normalize(subcategoryName),
        );
        if (matchingSubcategories.length !== 1) {
          rowErrors.push(
            matchingSubcategories.length === 0
              ? `Sous-catégorie « ${subcategoryName} » inconnue pour « ${category.name} ».`
              : `La sous-catégorie « ${subcategoryName} » est ambiguë.`,
          );
        } else {
          subcategoryId = matchingSubcategories[0].id;
        }
      } else if (subcategoryName) {
        rowErrors.push('La sous-catégorie ne peut pas être vérifiée sans catégorie valide.');
      }

      const priceText = getCell(row, 'priceUSD');
      const priceUSD = parseNumber(priceText);
      if (
        priceText &&
        (priceUSD === null ||
          priceUSD < 0 ||
          priceUSD > 99999999.99 ||
          !/^\d+(?:[.,]\d{1,2})?$/.test(priceText.replace(/\s/g, '')))
      ) {
        rowErrors.push('Le prix doit être un nombre positif ou nul avec au plus 2 décimales.');
      }
      const quoteOnly = parseBoolean(getCell(row, 'isQuoteOnly'), false);
      if (quoteOnly === null) rowErrors.push('« Sur devis » doit valoir oui ou non.');

      const minimumText = getCell(row, 'minOrderQuantity');
      const minimum = minimumText ? parseNumber(minimumText) : 1;
      if (
        minimum === null ||
        !Number.isInteger(minimum) ||
        minimum < 1 ||
        minimum > 10000
      ) {
        rowErrors.push('La quantité minimale doit être un entier entre 1 et 10 000.');
      }

      const stockText = getCell(row, 'stockQuantity');
      const stockQuantity = stockText ? parseNumber(stockText) : 0;
      if (
        stockQuantity === null ||
        !Number.isInteger(stockQuantity) ||
        stockQuantity < 0 ||
        stockQuantity > 10000000
      ) {
        rowErrors.push('Le stock doit être un entier entre 0 et 10 000 000.');
      }
      const providedStatus = getCell(row, 'stockStatus').toUpperCase();
      const allowedStatuses: StockStatus[] = [
        'IN_STOCK',
        'LOW_STOCK',
        'OUT_OF_STOCK',
        'ON_ORDER',
      ];
      if (providedStatus && !allowedStatuses.includes(providedStatus as StockStatus)) {
        rowErrors.push('Statut de stock invalide : utilisez IN_STOCK, LOW_STOCK, OUT_OF_STOCK ou ON_ORDER.');
      }
      const stockStatus = (
        providedStatus ||
        ((stockQuantity ?? 0) === 0
          ? 'OUT_OF_STOCK'
          : (stockQuantity ?? 0) < 5
            ? 'LOW_STOCK'
            : 'IN_STOCK')
      ) as StockStatus;

      const booleanFields = [
        ['isFeatured', 'Mis en avant'],
        ['isNew', 'Nouveau'],
        ['isActive', 'Actif'],
        ['isPublic', 'Accessible aux clients'],
      ] as const;
      const booleanValues = new Map<ImportField, boolean>();
      for (const [field, label] of booleanFields) {
        const value = parseBoolean(
          getCell(row, field),
          field === 'isActive' || field === 'isPublic',
        );
        if (value === null) rowErrors.push(`« ${label} » doit valoir oui ou non.`);
        else booleanValues.set(field, value);
      }

      const imageUrls = getCell(row, 'imageUrls')
        .split('|')
        .map((url) => url.trim())
        .filter(Boolean);
      for (const imageUrl of imageUrls) {
        if (imageUrl.length > 2048) {
          rowErrors.push('Une URL d’image ne peut pas dépasser 2 048 caractères.');
          continue;
        }
        try {
          const url = new URL(imageUrl);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            rowErrors.push(`URL d’image non prise en charge : « ${imageUrl} ».`);
          }
        } catch {
          rowErrors.push(`URL d’image invalide : « ${imageUrl} ».`);
        }
      }

      const localProductImages: LocalImage[] = [];
      if (sku) {
        const skuPrefix = `${sku.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}__`;
        const matchingImages = localImages
          .filter((image) => {
            const basename = image.name.split('/').pop() || '';
            const basenameWithoutExtension = basename.replace(/\.[^.]+$/, '');
            return basenameWithoutExtension
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .startsWith(skuPrefix);
          })
          .sort((left, right) =>
            left.name.localeCompare(right.name, undefined, {
              numeric: true,
              sensitivity: 'base',
            }),
          );
        for (const image of matchingImages) {
          if (!/^.+__\d{2,}$/.test(
            (image.name.split('/').pop() || '').replace(/\.[^.]+$/, ''),
          )) {
            rowErrors.push(
              `Nom d’image invalide « ${image.name} » : utilisez ${sku}__01.jpg.`,
            );
            continue;
          }
          const previewUrl = URL.createObjectURL(image.blob);
          previewUrls.current.push(previewUrl);
          localProductImages.push({
            filename: image.name.split('/').pop() || image.name,
            blob: image.blob,
            previewUrl,
          });
        }
        const imageNumbers = localProductImages.map((image) =>
          Number((image.filename.match(/__(\d{2,})\.[^.]+$/) || [])[1]),
        );
        if (new Set(imageNumbers).size !== imageNumbers.length) {
          rowErrors.push('Deux images portent le même numéro pour cette référence SKU.');
        }
      }
      if (imageUrls.length + localProductImages.length > 12) {
        rowErrors.push('Un produit ne peut pas avoir plus de 12 images.');
      }

      const specifications = safeJsonSpecifications(
        getCell(row, 'specifications'),
      );
      if (specifications.error) rowErrors.push(specifications.error);
      const shortDesc = getCell(row, 'shortDesc');
      const description = getCell(row, 'description');
      const unit = getCell(row, 'unit') || 'Pièce';
      if (shortDesc.length > 500) {
        rowErrors.push('La description courte ne peut pas dépasser 500 caractères.');
      }
      if (description.length > 10000) {
        rowErrors.push('La description détaillée ne peut pas dépasser 10 000 caractères.');
      }
      if (unit.length > 40) rowErrors.push('L’unité ne peut pas dépasser 40 caractères.');

      parsed.push({
        sku,
        name,
        slug: makeSlug(name, sku),
        categoryId: category?.id || '',
        ...(subcategoryId ? { subcategoryId } : {}),
        priceUSD: priceUSD ?? null,
        isQuoteOnly: quoteOnly ?? false,
        unit,
        minOrderQuantity: minimum ?? 1,
        stockQuantity: stockQuantity ?? 0,
        stockStatus,
        isFeatured: booleanValues.get('isFeatured') ?? false,
        isNew: booleanValues.get('isNew') ?? false,
        isActive: booleanValues.get('isActive') ?? true,
        isPublic: booleanValues.get('isPublic') ?? true,
        images: imageUrls,
        shortDesc,
        description,
        specifications: specifications.data || {},
        localImages: localProductImages,
        rowNumber,
        errors: rowErrors,
      });
    });

    if (parsed.length === 0) throw new Error('Aucune ligne produit non vide détectée.');
    if (parsed.length > 500) {
      throw new Error('Un fichier peut contenir au maximum 500 produits par importation.');
    }

    const skuCounts = new Map<string, number>();
    parsed.forEach(({ sku }) => {
      if (sku) skuCounts.set(sku.toLowerCase(), (skuCounts.get(sku.toLowerCase()) || 0) + 1);
    });
    const existingSkus = new Set(products.map((product) => product.sku.toLowerCase()));
    parsed.forEach((product) => {
      if ((skuCounts.get(product.sku.toLowerCase()) || 0) > 1) {
        product.errors.push('Cette référence SKU apparaît plusieurs fois dans le fichier.');
      }
      if (existingSkus.has(product.sku.toLowerCase())) {
        product.errors.push('Cette référence SKU existe déjà dans le catalogue.');
      }
    });
    const unmatchedImages = localImages.filter((image) => {
      const basename = image.name.split('/').pop() || '';
      const skuPrefix = (basename.replace(/\.[^.]+$/, '').split('__')[0] || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      return !parsed.some(
        (product) =>
          product.sku.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() ===
          skuPrefix,
      );
    });
    if (unmatchedImages.length) {
      throw new Error(
        `Images ZIP sans produit correspondant : ${unmatchedImages.map((image) => image.name).join(', ')}. Nommez-les SKU__01.jpg, SKU__02.png, etc.`,
      );
    }
    return parsed;
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    clearPreviewUrls();
    setParsedProducts([]);
    setError('');
    setFileName(file.name);
    setIsReading(true);
    try {
      if (file.size > 25 * 1024 * 1024) {
        throw new Error('Le fichier ne peut pas dépasser 25 Mo.');
      }
      const imported =
        file.name.toLowerCase().endsWith('.zip')
          ? await readZipImport(file)
          : { rows: await readWorkbook(file), images: [] };
      setParsedProducts(parseRows(imported.rows, imported.images));
    } catch (caught) {
      clearPreviewUrls();
      setError(
        caught instanceof Error
          ? caught.message
          : 'Impossible de lire ce fichier.',
      );
    } finally {
      setIsReading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    setError('');
    try {
      await downloadTemplate(categories);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `Impossible de créer le modèle Excel : ${caught.message}`
          : 'Impossible de créer le modèle Excel.',
      );
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleImport = async () => {
    if (parsedProducts.some((product) => product.errors.length > 0)) return;
    setIsImporting(true);
    try {
      const productsWithUploadedImages: Partial<Product>[] = [];
      let uploadedCount = 0;
      const totalImages = parsedProducts.reduce(
        (total, product) => total + product.localImages.length,
        0,
      );
      for (const product of parsedProducts) {
        const uploadedUrls: string[] = [];
        for (const image of product.localImages) {
          if (image.uploadedUrl) {
            uploadedUrls.push(image.uploadedUrl);
            uploadedCount += 1;
            continue;
          }
          setImportProgress(
            `Téléversement des images ${uploadedCount + 1}/${totalImages}…`,
          );
          const response = await fetch('/api/admin/product-import/images', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': image.blob.type || imageMimeType(image.filename),
              'X-File-Name': encodeURIComponent(image.filename),
            },
            body: image.blob,
          });
          const responseText = await response.text();
          let result: { error?: string; url?: unknown };
          try {
            result = JSON.parse(responseText) as { error?: string; url?: unknown };
          } catch {
            throw new Error(
              response.status === 413
                ? 'Une image dépasse la limite de 8 Mo.'
                : `Le service de stockage a retourné une réponse invalide (${response.status}).`,
            );
          }
          if (!response.ok) {
            throw new Error(result.error || `Échec du téléversement de ${image.filename}.`);
          }
          const uploadedUrl = result.url;
          if (typeof uploadedUrl !== 'string') {
            throw new Error(`Le stockage n’a pas retourné d’URL pour ${image.filename}.`);
          }
          uploadedUrls.push(uploadedUrl);
          uploadedCount += 1;
          setParsedProducts((previous) =>
            previous.map((item) =>
              item.rowNumber === product.rowNumber
                ? {
                    ...item,
                    localImages: item.localImages.map((localImage) =>
                      localImage.filename === image.filename
                        ? { ...localImage, uploadedUrl }
                        : localImage,
                    ),
                  }
                : item,
            ),
          );
        }
        productsWithUploadedImages.push({
          ...asProductPayload(product),
          images: [...product.images, ...uploadedUrls],
        });
      }
      setImportProgress('Enregistrement des produits…');
      await onImportProducts(productsWithUploadedImages);
      clearPreviewUrls();
      setParsedProducts([]);
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'L’importation a échoué.',
      );
    } finally {
      setIsImporting(false);
      setImportProgress('');
    }
  };

  if (!isOpen) return null;

  const invalidCount = parsedProducts.filter(
    (product) => product.errors.length > 0,
  ).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-xs sm:p-5">
      <section className="my-5 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
              <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
              Importer des produits Excel
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Importez un classeur .xlsx, un fichier .csv ou un ZIP avec des images produits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-slate-800">Préparez votre fichier</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Le modèle contient les champs pris en charge, les formats attendus et les catégories du catalogue. Maximum 500 produits par importation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleDownloadTemplate()}
              disabled={isDownloadingTemplate}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#0A3B8C] px-3 py-2 text-xs font-bold text-[#0A3B8C] hover:bg-blue-50 disabled:opacity-50"
            >
              {isDownloadingTemplate ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloadingTemplate ? 'Création du modèle…' : 'Télécharger le modèle Excel'}
            </button>
          </div>

          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center hover:border-[#0A3B8C] hover:bg-blue-50/50">
            <input
              type="file"
              accept=".xlsx,.csv,.zip,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/zip"
              className="sr-only"
              disabled={isReading || isImporting}
              onChange={(event) => {
                void handleFile(event.currentTarget.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
            {isReading ? (
              <LoaderCircle className="h-7 w-7 animate-spin text-[#0A3B8C]" />
            ) : (
              <Upload className="h-7 w-7 text-[#0A3B8C]" />
            )}
            <span className="text-sm font-bold text-slate-800">
              {isReading ? 'Lecture et validation du fichier…' : 'Sélectionner un fichier Excel, CSV ou ZIP'}
            </span>
            <span className="text-xs text-slate-500">
              {fileName || 'Fichiers jusqu’à 25 Mo · ZIP : un classeur et les images SKU__01.jpg'}
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {parsedProducts.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  Aperçu : {parsedProducts.length} produit(s)
                </div>
                {invalidCount > 0 ? (
                  <span className="text-xs font-bold text-rose-700">
                    {invalidCount} ligne(s) à corriger avant l’import
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700">
                    Toutes les lignes sont valides
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="sticky top-0 bg-white text-[10px] uppercase text-slate-500 shadow-sm">
                    <tr>
                      <th className="px-3 py-2">Produit / ligne</th>
                      <th className="px-3 py-2">Prix</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Images</th>
                      <th className="px-3 py-2">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedProducts.map((product) => (
                      <tr
                        key={`${product.rowNumber}-${product.sku}`}
                        className={product.errors.length ? 'bg-rose-50/60' : ''}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {product.images[0] || product.localImages[0] ? (
                              <img
                                src={product.images[0] || product.localImages[0].previewUrl}
                                alt=""
                                className="h-9 w-9 rounded-md border border-slate-200 object-cover"
                              />
                            ) : (
                              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                                <ImageIcon className="h-4 w-4" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate font-bold text-slate-800">
                                {product.name || '(nom manquant)'}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500">
                                {product.sku || '(SKU manquant)'} · ligne {product.rowNumber}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-semibold">
                          {product.isQuoteOnly
                            ? 'Sur devis'
                            : product.priceUSD == null
                              ? 'Non défini'
                              : `$${product.priceUSD.toFixed(2)}`}
                        </td>
                        <td className="px-3 py-2.5">
                          {product.stockQuantity} {product.unit || 'Pièce'}
                        </td>
                        <td className="px-3 py-2.5">
                          {product.images.length + product.localImages.length}
                        </td>
                        <td className="max-w-72 px-3 py-2.5">
                          {product.errors.length ? (
                            <ul className="list-inside list-disc space-y-0.5 text-[10px] text-rose-700">
                              {product.errors.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="font-semibold text-emerald-700">Valide</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <footer className="flex flex-col-reverse items-stretch justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-xs text-slate-500">
            {isImporting
              ? importProgress
              : 'Les lignes invalides doivent être corrigées dans le fichier avant de recommencer.'}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => void handleImport()}
              disabled={
                isImporting ||
                isReading ||
                parsedProducts.length === 0 ||
                invalidCount > 0
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isImporting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Importer {parsedProducts.length || ''} produit(s)
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};
