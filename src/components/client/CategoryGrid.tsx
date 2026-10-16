import React from 'react';
import { Radio, Wrench, ShieldCheck, PackageCheck, ArrowRight, Layers } from 'lucide-react';
import { Category } from '../../types';

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubcategory?: (categoryId: string, subcategorySlug: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectSubcategory,
}) => {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'fourniture-appareils':
        return <Radio className="w-5 h-5 text-blue-600" />;
      case 'pieces-de-rechange':
        return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'hygiene-materiel-bureau':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'services-autres':
        return <PackageCheck className="w-5 h-5 text-indigo-600" />;
      default:
        return <Layers className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Rayons d'approvisionnement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            4 pôles d'activités techniques dédiés aux professionnels et institutions
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-[#0A3B8C] hover:underline cursor-pointer"
          >
            Tous les rayons
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-2 border-[#0A3B8C] bg-blue-50/20 shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? 'text-[#0A3B8C]' : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0A3B8C] transition-colors mb-1">
                  {cat.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {cat.description}
                </p>

                {/* Subcategories rendered cleanly with typographic separators (anti-slop rule) */}
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  {cat.subcategories.map((sub, i) => (
                    <React.Fragment key={sub.id}>
                      <span className="hover:text-slate-700 transition-colors">
                        {sub.name}
                      </span>
                      {i < cat.subcategories.length - 1 && (
                        <span aria-hidden="true" className="mx-1 text-slate-300">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>{cat.subcategories.length} sous-catégories</span>
                <span className="text-[#0A3B8C]">Consulter</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
