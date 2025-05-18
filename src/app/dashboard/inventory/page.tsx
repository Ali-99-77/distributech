"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

interface InventoryItem {
    inv_id: string;
    whs_id: string;
    prd_id: string;
    inv_quantity_on_hand: number;
    inv_quantity_required: number;
    inv_updated_at: string;
    prd_name?: string;
    prd_category?: string;
    prd_unit_price?: number;
    whs_name?: string;
}

interface Warehouse {
    whs_id: string;
    whs_name: string;
}

interface Product {
    prd_id: string;
    prd_name: string;
    prd_category: string;
    prd_unit_price: number;
}

export default function InventoryPage() {
    const user = useUser();
    const router = useRouter();

    React.useEffect(() => {
        if (user.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [user.role, router]);

    if (user.role !== 'admin') {
        return null;
    }

    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newInventory, setNewInventory] = useState({
        whs_id: '',
        prd_id: '',
        inv_quantity_on_hand: 0,
        inv_quantity_required: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const warehousesResponse = await fetch('/api/warehouses');
                if (!warehousesResponse.ok) throw new Error('Failed to fetch warehouses');
                const warehousesResult = await warehousesResponse.json();
                console.log('Warehouses Response:', warehousesResult);
                if (warehousesResult.success) {
                    setWarehouses(warehousesResult.data);
                } else {
                    throw new Error('Failed to fetch warehouses data');
                }

                const productsResponse = await fetch('/api/products');
                if (!productsResponse.ok) throw new Error('Failed to fetch products');
                const productsResult = await productsResponse.json();
                if (productsResult.success) {
                    setProducts(productsResult.data);
                }

                console.log('Fetching inventory data...');
                const inventoryResponse = await fetch('/api/inventory');
                if (!inventoryResponse.ok) throw new Error('Failed to fetch inventory');
                const inventoryResult = await inventoryResponse.json();
                console.log('Inventory Response:', inventoryResult);
                if (inventoryResult.success) {
                    const joinedInventoryData = inventoryResult.data.map((item: InventoryItem) => {
                        const product = productsResult.data.find((p: Product) => p.prd_id === item.prd_id);
                        const warehouse = warehousesResult.data.find((w: Warehouse) => w.whs_id === item.whs_id);
                        return {
                            ...item,
                            prd_name: product?.prd_name,
                            prd_category: product?.prd_category,
                            prd_unit_price: product?.prd_unit_price,
                            whs_name: warehouse?.whs_name
                        };
                    });
                    console.log('Joined Inventory Data:', joinedInventoryData);
                    setInventoryData(joinedInventoryData);
                } else {
                    throw new Error('Failed to fetch inventory data');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockStatusFilter, setStockStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const handleStockUpdate = async (itemId: string, newStock: number) => {
        try {
            const response = await fetch('/api/inventory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemId, stock: newStock })
            });
            if (!response.ok) throw new Error('Failed to update stock');
            const result = await response.json();
            if (result.success) {
                setInventoryData(prevData =>
                    prevData.map(item =>
                        item.inv_id === itemId ? { ...item, inv_quantity_on_hand: newStock } : item
                    )
                );
            } else {
                throw new Error('Failed to update stock');
            }
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    const handleViewHistory = async (itemId: string) => {
        try {
            const response = await fetch(`/api/inventory/${itemId}/history`);
            if (!response.ok) throw new Error('Failed to fetch stock history');
            const historyData = await response.json();
        } catch (error) {
            console.error('Error fetching stock history:', error);
        }
    };

    const handleAddInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInventory)
            });
            if (!response.ok) throw new Error('Failed to add inventory item');
            const result = await response.json();
            if (result.success) {
                const inventoryResponse = await fetch('/api/inventory');
                if (inventoryResponse.ok) {
                    const inventoryResult = await inventoryResponse.json();
                    if (inventoryResult.success) {
                        setInventoryData(inventoryResult.data);
                    }
                }
                setShowAddModal(false);
                setNewInventory({
                    whs_id: '',
                    prd_id: '',
                    inv_quantity_on_hand: 0,
                    inv_quantity_required: 0
                });
            }
        } catch (error) {
            console.error('Error adding inventory item:', error);
        }
    };

    const handleUpdateInventory = async (itemId: string, updates: { inv_quantity_on_hand: number; inv_quantity_required: number }) => {
        try {
            const response = await fetch('/api/inventory', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: itemId,
                    ...updates
                })
            });
            if (!response.ok) throw new Error('Failed to update inventory item');
            const result = await response.json();
            if (result.success) {
                setInventoryData(prevData =>
                    prevData.map(item =>
                        item.inv_id === itemId
                            ? {
                                ...item,
                                inv_quantity_on_hand: updates.inv_quantity_on_hand,
                                inv_quantity_required: updates.inv_quantity_required,
                                inv_updated_at: new Date().toISOString()
                            }
                            : item
                    )
                );
            }
        } catch (error) {
            console.error('Error updating inventory item:', error);
        }
    };

    const filteredData = useMemo(() => {
        return inventoryData.filter(item => {
            const matchesWarehouse = !selectedWarehouse || item.whs_id === selectedWarehouse;
            const matchesSearch = item.prd_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
            const matchesCategory = !categoryFilter || item.prd_category?.toLowerCase() === categoryFilter.toLowerCase();

            let status = '';
            if (item.inv_quantity_on_hand === 0) status = 'out of stock';
            else if (item.inv_quantity_on_hand <= item.inv_quantity_required) status = 'low stock';
            else status = 'in stock';
            const matchesStockStatus = !stockStatusFilter || status === stockStatusFilter.toLowerCase();
            return matchesWarehouse && matchesSearch && matchesCategory && matchesStockStatus;
        });
    }, [selectedWarehouse, searchQuery, categoryFilter, stockStatusFilter, inventoryData]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredData.length);

    const categories = useMemo(() => {
        return [...new Set(inventoryData.map(item => item.prd_category))];
    }, [inventoryData]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedWarehouse, searchQuery, categoryFilter, stockStatusFilter]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inventory Management</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Add Inventory
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <select
                    value={selectedWarehouse}
                    onChange={e => setSelectedWarehouse(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px] bg-white shadow-sm"
                >
                    <option key="all" value="">All Warehouses</option>
                    {warehouses.map(whs => (
                        <option key={whs.whs_id} value={whs.whs_id}>{whs.whs_name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center animate-fade-in">
                <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option key="all-categories" value="">All Categories</option>
                    {categories.map((category, index) => (
                        <option key={`${category}-${index}`} value={category}>{category}</option>
                    ))}
                </select>
                <select
                    value={stockStatusFilter}
                    onChange={(e) => setStockStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option key="all-status" value="">Stock Status</option>
                    <option key="in-stock" value="in stock">In Stock</option>
                    <option key="low-stock" value="low stock">Low Stock</option>
                    <option key="out-of-stock" value="out of stock">Out of Stock</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Warehouse</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">On Hand</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Required</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Last Updated</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-400">No inventory found.</td>
                                </tr>
                            ) : paginatedData.map((item) => {
                                const product = products.find(p => p.prd_id === item.prd_id);
                                const warehouse = warehouses.find(w => w.whs_id === item.whs_id);

                                let status = '';
                                let color = '';
                                if (item.inv_quantity_on_hand === 0) {
                                    status = 'Out of Stock';
                                    color = 'red';
                                }
                                else if (item.inv_quantity_on_hand <= item.inv_quantity_required) {
                                    status = 'Low Stock';
                                    color = 'yellow';
                                }
                                else {
                                    status = 'In Stock';
                                    color = 'green';
                                }

                                return (
                                    <tr key={item.inv_id} className="hover:bg-blue-50 transition-all duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-gradient-to-br from-blue-200 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold shadow-inner">
                                                    {product?.prd_name?.[0] || '?'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">{product?.prd_name || 'Unknown Product'}</div>
                                                    <div className="text-xs text-gray-400">ID: #{item.prd_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{product?.prd_category || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{warehouse?.whs_name || 'Unknown Warehouse'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-bold">{item.inv_quantity_on_hand} units</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-bold">{item.inv_quantity_required} units</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-800 font-semibold shadow-sm whitespace-nowrap inline-block`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(item.inv_updated_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button className="text-blue-600 hover:text-blue-800 font-medium transition">Update Stock</button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Update Stock</DialogTitle>
                                                            <DialogDescription>
                                                                Update the stock levels for {product?.prd_name || 'this product'}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={(e) => {
                                                            e.preventDefault();
                                                            const form = e.target as HTMLFormElement;
                                                            const updates = {
                                                                inv_quantity_on_hand: parseInt(form.quantity_on_hand.value),
                                                                inv_quantity_required: parseInt(form.quantity_required.value)
                                                            };
                                                            handleUpdateInventory(item.inv_id, updates);
                                                            form.reset();
                                                        }}>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1">Current Stock</label>
                                                                    <input type="number" value={item.inv_quantity_on_hand} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-50" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1">New Stock Level</label>
                                                                    <input type="number" name="quantity_on_hand" min="0" required className="w-full px-3 py-2 border rounded-lg" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1">Required Quantity</label>
                                                                    <input type="number" name="quantity_required" min="0" required className="w-full px-3 py-2 border rounded-lg" />
                                                                </div>
                                                            </div>
                                                            <DialogFooter className="mt-4">
                                                                <DialogClose asChild>
                                                                    <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                                                </DialogClose>
                                                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update</button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-lg mt-2 animate-fade-in">
                <div className="text-sm text-gray-500">
                    Showing {startItem} to {endItem} of {filteredData.length} items
                </div>
                <div className="flex gap-2">
                    <button
                        className={`px-3 py-1 border border-gray-200 rounded-lg hover:bg-blue-50 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`px-3 py-1 rounded-lg transition ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-blue-50'}`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className={`px-3 py-1 border border-gray-200 rounded-lg hover:bg-blue-50 transition ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </button>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
                        <h3 className="text-lg font-semibold mb-4">Add New Inventory Item</h3>
                        <form onSubmit={handleAddInventory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Warehouse</label>
                                <select
                                    value={newInventory.whs_id}
                                    onChange={(e) => setNewInventory(prev => ({ ...prev, whs_id: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                >
                                    <option value="">Select Warehouse</option>
                                    {warehouses.map(whs => (
                                        <option key={whs.whs_id} value={whs.whs_id}>{whs.whs_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Product</label>
                                <select
                                    value={newInventory.prd_id}
                                    onChange={(e) => setNewInventory(prev => ({ ...prev, prd_id: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.map(prd => (
                                        <option key={prd.prd_id} value={prd.prd_id}>{prd.prd_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity On Hand</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newInventory.inv_quantity_on_hand}
                                    onChange={(e) => setNewInventory(prev => ({ ...prev, inv_quantity_on_hand: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Required Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newInventory.inv_quantity_required}
                                    onChange={(e) => setNewInventory(prev => ({ ...prev, inv_quantity_required: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 