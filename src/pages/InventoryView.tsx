/**
 * Laboratory Inventory & Facility Consumables Management
 * Tracks Reference Standard Weights (E2/F1), calibration reagents, and triggers automated low-stock notifications.
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Plus,
  Search,
  Filter,
  PackageCheck,
  Building,
} from 'lucide-react';
import { InventoryItem, UserProfile } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  currentUser: UserProfile;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  currentUser,
  onUpdateItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newQty, setNewQty] = useState<number>(0);

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    await onUpdateItem(editingItem.id, { quantity: newQty });
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[#162F4D]">
            Laboratory Reference Standards, Weights & Chemical Reagents
          </h1>
          <p className="text-xs text-[#6F7478]">
            Automated threshold monitoring for Class E2/F1 mass standards, climatic chamber calibration reagents, and tamper seals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item, batch, cabinet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#F6F7F7] border border-gray-300 rounded text-xs text-[#162F4D] w-64 focus:outline-hidden"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F6F7F7] border border-gray-300 rounded px-3 py-1.5 text-xs text-[#162F4D]"
          >
            <option value="ALL">All Categories</option>
            <option value="REFERENCE_WEIGHTS">Reference Weights</option>
            <option value="CALIBRATION_REAGENTS">Calibration Reagents</option>
            <option value="CONSUMABLES">Consumables & Seals</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F7F7] font-semibold text-[#162F4D] border-b border-gray-200">
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Quantity</th>
                <th className="p-3">Minimum Safety Threshold</th>
                <th className="p-3">Storage Location</th>
                <th className="p-3">Batch / Certificate</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.minThreshold;

                return (
                  <tr key={item.id} className="hover:bg-[#F6F7F7]">
                    <td className="p-3">
                      <div className="font-bold text-[#162F4D]">{item.name}</div>
                      {item.notes && (
                        <div className="text-[10px] text-[#6F7478] mt-0.5">{item.notes}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="bg-[#E9F4FD] text-[#2F699C] px-2 py-0.5 rounded text-[10px] font-semibold">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-[#162F4D]">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-3 text-[#6F7478]">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="p-3 text-[#234B70]">{item.location}</td>
                    <td className="p-3 font-mono text-[11px] text-[#6F7478]">{item.batchNumber}</td>
                    <td className="p-3">
                      {isLow ? (
                        <span className="bg-red-50 text-[#C0392B] border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock Alert</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-[#1A7A4A] border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Adequate</span>
                        </span>
                      )}
                      {item.isExpiringSoon && (
                        <span className="bg-amber-50 text-[#D4870A] border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold block mt-1">
                          Expiring Soon
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setNewQty(item.quantity);
                        }}
                        className="text-[#2F699C] hover:underline font-semibold text-xs"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-gray-300 w-full max-w-md p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#162F4D]">
              Adjust Stock: {editingItem.name}
            </h3>
            <p className="text-[#6F7478]">
              Current threshold: {editingItem.minThreshold} {editingItem.unit}
            </p>

            <form onSubmit={handleUpdateStock} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#162F4D] mb-1">
                  Updated Available Quantity ({editingItem.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 text-xs text-[#162F4D]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-[#6F7478]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2F699C] hover:bg-[#162F4D] text-white rounded font-semibold"
                >
                  Save Stock Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
