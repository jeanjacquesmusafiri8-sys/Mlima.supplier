import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Check, Radio, Wrench, ShieldCheck, PackageCheck, FolderPlus } from 'lucide-react';
import { Category, Subcategory } from '../../types';

interface AdminCategoriesProps {
  categories: Category[];
  onAddCategory: (categoryData: Omit<Category, 'id' | 'subcategories'>) => void;
  onAddSubcategory: (categoryId: string, subcategoryName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteSubcategory: (categoryId: string, subcategoryId: string) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  onAddCategory,
  onAddSubcategory,
  onDeleteCategory,
  onDeleteSubcategory,
}) => {
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');

  const [activeCatForSub, setActiveCatForSub] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCategory({
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: newCatDesc.trim(),
      icon: newCatIcon,
      order: categories.length + 1,
      isActive: true,
    });

    setNewCatName('');
    setNewCatDesc('');
    setShowAddCat(false);
  };

  const handleCreateSubcategory = (categoryId: string) => {
    if (!newSubName.trim()) return;
    onAddSubcategory(categoryId, newSubName.trim());
    setNewSubName('');
    setActiveCatForSub(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Structure des Catégories & Rayons
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organisez les pôles d'activités et les sous-catégories pour faciliter la recherche client.
          </p>
        </div>

        <button
          onClick={() => setShowAddCat(true)}
          className="flex items-center gap-1.5 bg-[#0A3B8C] hover:bg-[#082e6d] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Nouvelle Catégorie Principale</span>
        </button>
      </div>

      {/* Add Category Form Modal / Inline */}
      {showAddCat && (
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#0A3B8C] text-sm flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              <span>Créer une Catégorie Principale</span>
            </h3>
            <button
              onClick={() => setShowAddCat(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Annuler
            </button>
          </div>

          <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-700 mb-1">Nom de la catégorie</label>
              <input
                type="text"
                required
                placeholder="Ex: Énergie & Électricité Solaire"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Courte description pour orienter les clients..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-[#0A3B8C] text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Enregistrer la catégorie
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0A3B8C] text-white flex items-center justify-center font-bold">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">/{cat.slug}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Supprimer la catégorie ${cat.name} ?`)) {
                      onDeleteCategory(cat.id);
                    }
                  }}
                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Supprimer la catégorie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-2">{cat.description}</p>

              {/* Subcategories list */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                  <span>Sous-catégories ({cat.subcategories.length})</span>
                  <button
                    onClick={() => setActiveCatForSub(activeCatForSub === cat.id ? null : cat.id)}
                    className="text-[#0A3B8C] hover:underline flex items-center gap-1 font-semibold normal-case cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Ajouter sous-catégorie
                  </button>
                </div>

                {/* Inline form to add subcategory */}
                {activeCatForSub === cat.id && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Nom sous-catégorie (ex: Moteurs hors-bord)..."
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded p-1.5 text-xs focus:outline-none"
                    />
                    <button
                      onClick={() => handleCreateSubcategory(cat.id)}
                      className="bg-emerald-600 text-white px-2.5 py-1.5 rounded text-xs font-bold"
                    >
                      Ajouter
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {cat.subcategories.map((sub) => (
                    <span
                      key={sub.id}
                      className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium"
                    >
                      <span>{sub.name}</span>
                      <button
                        onClick={() => onDeleteSubcategory(cat.id, sub.id)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Ordre d'affichage : #{cat.order}</span>
              <span className="text-emerald-700 font-semibold">● Actif en vitrine</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
