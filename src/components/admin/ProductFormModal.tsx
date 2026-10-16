import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Tag,
  DollarSign,
  Package,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { Product, Category, StockStatus } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  categories: Category[];
  onSaveProduct: (productData: Partial<Product>) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSaveProduct,
}) => {
  if (!isOpen) return null;

  const isEditing = !!productToEdit;

  const [sku, setSku] = useState(productToEdit?.sku || '');
  const [name, setName] = useState(productToEdit?.name || '');
  const [categoryId, setCategoryId] = useState(
    productToEdit?.categoryId || (categories.length > 0 ? categories[0].id : '')
  );
  const [subcategoryId, setSubcategoryId] = useState(productToEdit?.subcategoryId || '');
  const [priceUSD, setPriceUSD] = useState<string>(
    productToEdit?.priceUSD !== null && productToEdit?.priceUSD !== undefined
      ? String(productToEdit.priceUSD)
      : ''
  );
  const [isQuoteOnly, setIsQuoteOnly] = useState(productToEdit?.isQuoteOnly || false);
  const [unit, setUnit] = useState(productToEdit?.unit || 'Pièce');
  const [stockQuantity, setStockQuantity] = useState<number>(productToEdit?.stockQuantity ?? 10);
  const [stockStatus, setStockStatus] = useState<StockStatus>(
    productToEdit?.stockStatus || 'IN_STOCK'
  );
  const [isFeatured, setIsFeatured] = useState(productToEdit?.isFeatured || false);
  const [isNew, setIsNew] = useState(productToEdit?.isNew || false);
  const [isActive, setIsActive] = useState(productToEdit?.isActive ?? true);
  const [images, setImages] = useState<string[]>(
    productToEdit?.images && productToEdit.images.length > 0
      ? productToEdit.images
      : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80']
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [shortDesc, setShortDesc] = useState(productToEdit?.shortDesc || '');
  const [description, setDescription] = useState(productToEdit?.description || '');

  // Specifications
  const [specList, setSpecList] = useState<{ key: string; val: string }[]>(
    productToEdit?.specifications
      ? Object.entries(productToEdit.specifications).map(([key, val]) => ({ key, val }))
      : [
          { key: 'Origine', val: 'Certifié constructeur' },
          { key: 'Garantie', val: '6 à 12 mois MLIMA Supplier' },
        ]
  );

  const currentCategory = categories.find((c) => c.id === categoryId);

  // Auto-generate SKU if new and empty
  useEffect(() => {
    if (!isEditing && !sku) {
      const prefix = categoryId === 'cat-appareils' ? 'ML-APP' : categoryId === 'cat-pieces' ? 'ML-PIEC' : categoryId === 'cat-hygiene' ? 'ML-HYG' : 'ML-GEN';
      setSku(`${prefix}-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [categoryId, isEditing, sku]);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    setSpecList([...specList, { key: '', val: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecList(specList.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'val', value: string) => {
    const updated = [...specList];
    updated[index][field] = value;
    setSpecList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sku) {
      alert('Veuillez renseigner le nom et la référence SKU du produit.');
      return;
    }

    const specificationsObj: Record<string, string> = {};
    specList.forEach((item) => {
      if (item.key.trim() && item.val.trim()) {
        specificationsObj[item.key.trim()] = item.val.trim();
      }
    });

    const parsedPrice = priceUSD && !isQuoteOnly ? parseFloat(priceUSD) : null;

    const payload: Partial<Product> = {
      ...(productToEdit ? { id: productToEdit.id } : {}),
      sku: sku.trim(),
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      categoryId,
      subcategoryId: subcategoryId || undefined,
      priceUSD: parsedPrice,
      isQuoteOnly,
      unit,
      stockQuantity: Number(stockQuantity),
      stockStatus,
      isFeatured,
      isNew,
      isActive,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
      shortDesc: shortDesc.trim(),
      description: description.trim(),
      specifications: specificationsObj,
      updatedAt: new Date().toISOString(),
      ...(productToEdit ? {} : { createdAt: new Date().toISOString() }),
    };

    onSaveProduct(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isEditing ? `Modifier le Produit : ${productToEdit.sku}` : 'Ajouter une Nouvelle Référence au Catalogue'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestion de stock et fiche technique MLIMA Supplier
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Référence / Code SKU MLIMA <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: ML-APP-001"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nom Commercial du Produit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Radio Kenwood VHF / Pneu 7.50 R16"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Catégorie Principale
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Sous-Catégorie / Rayon
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              >
                <option value="">Sélectionner une sous-catégorie...</option>
                {currentCategory?.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing, Unit & Stock */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="font-bold text-[#0A3B8C] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Tarification & Stock</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Prix Unitaire (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={isQuoteOnly}
                  placeholder={isQuoteOnly ? 'Sur devis' : 'Ex: 145.00'}
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 focus:outline-none ${
                    isQuoteOnly
                      ? 'bg-slate-200 text-slate-400 border-slate-300'
                      : 'bg-white border-slate-300 focus:border-[#0A3B8C]'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Conditionnement / Unité
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pièce, Carton, Bidon 5L, Sac"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantité en Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => {
                    const q = parseInt(e.target.value) || 0;
                    setStockQuantity(q);
                    if (q === 0) setStockStatus('OUT_OF_STOCK');
                    else if (q < 5) setStockStatus('LOW_STOCK');
                    else setStockStatus('IN_STOCK');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Statut de Disponibilité
                </label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
                >
                  <option value="IN_STOCK">En Stock (Prêt au dépôt)</option>
                  <option value="LOW_STOCK">Stock Faible / Limité</option>
                  <option value="OUT_OF_STOCK">Rupture Temporaire</option>
                  <option value="ON_ORDER">Sur Commande Particulière</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isQuoteOnly}
                    onChange={(e) => setIsQuoteOnly(e.target.checked)}
                    className="w-4 h-4 text-[#0A3B8C] rounded border-slate-300 focus:ring-[#0A3B8C]"
                  />
                  <span>Uniquement sur Devis (Masquer le prix en boutique)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Visibility Badges & Features */}
          <div className="flex flex-wrap items-center gap-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-300"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Mis en avant (Page d'accueil)
              </span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 text-[#0A3B8C] rounded border-slate-300"
              />
              <span>Badge "Nouveau"</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300"
              />
              <span>Visible publiquement sur le site</span>
            </label>
          </div>

          {/* Images Management */}
          <div className="space-y-3">
            <label className="block font-bold text-slate-700">
              Galerie Photos (URLs directes d'images)
            </label>

            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Coller l'URL d'une image (ex: https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-[#0A3B8C] text-white px-3.5 py-2.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter Photo</span>
              </button>
            </div>

            {/* Images Previews */}
            <div className="flex flex-wrap gap-3 pt-2">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group"
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-rose-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description Courte (Aperçu fiche)
              </label>
              <input
                type="text"
                placeholder="Résumé percutant en une phrase..."
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description Technique Détaillée
              </label>
              <textarea
                rows={3}
                placeholder="Détails complets, usages recommandés, certifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>
          </div>

          {/* Technical Specifications Key-Value */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                Spécifications Techniques (Clé - Valeur)
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-[#0A3B8C] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Ajouter une ligne
              </button>
            </div>

            <div className="space-y-2">
              {specList.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Caractéristique (ex: Marque)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(i, 'key', e.target.value)}
                    className="w-1/3 bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0A3B8C]"
                  />
                  <input
                    type="text"
                    placeholder="Valeur (ex: Kenwood Pro)"
                    value={spec.val}
                    onChange={(e) => handleSpecChange(i, 'val', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#0A3B8C]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(i)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-[#0A3B8C] hover:bg-[#082e6d] text-white font-bold py-2.5 px-6 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>{isEditing ? 'Enregistrer les Modifications' : 'Créer le Produit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
