"use client"

import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { useState, useMemo, useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';
import React from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

interface Product {
    prd_id: string;
    prd_name: string;
    prd_category: string;
    prd_unit_price: number;
    prd_description?: string;
    stock: number;
    status: string;
    color: string;
}

export default function ProductsPage() {
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

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Starting to fetch products...');
                const response = await fetch('/api/products');
                console.log('Response status:', response.status);

                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
                }

                const responseData = await response.json();
                console.log('Raw API Response:', responseData);

                if (!responseData.data || !Array.isArray(responseData.data)) {
                    throw new Error('Invalid data format received from API');
                }

                const transformedProducts = responseData.data.map((row: any) => {
                    const stock = Math.floor(Math.random() * 21);
                    const product = {
                        prd_id: row.prd_id,
                        prd_name: row.prd_name,
                        prd_category: row.prd_category,
                        prd_unit_price: parseFloat(row.prd_unit_price),
                        prd_description: row.prd_description,
                        stock: stock,
                        status: stock > 10 ? 'in stock' : stock > 0 ? 'low stock' : 'out of stock',
                        color: stock > 10 ? 'green' : stock > 0 ? 'yellow' : 'red'
                    };
                    console.log('Transformed product:', product);
                    return product;
                });

                console.log('Final transformed products:', transformedProducts);
                setProducts(transformedProducts);
            } catch (error) {
                console.error('Error in fetchProducts:', error);
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockStatusFilter, setStockStatusFilter] = useState('');

    const filteredData = useMemo(() => {
        return products.filter(item => {
            const matchesSearch = item.prd_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !categoryFilter || item.prd_category.toLowerCase() === categoryFilter.toLowerCase();
            const matchesStockStatus = !stockStatusFilter || item.status.toLowerCase() === stockStatusFilter.toLowerCase();

            return matchesSearch && matchesCategory && matchesStockStatus;
        });
    }, [searchQuery, categoryFilter, stockStatusFilter, products]);

    useEffect(() => {
        console.log('Products state updated:', products);
    }, [products]);

    useEffect(() => {
        console.log('Filtered data:', filteredData);
    }, [filteredData]);

    const categories = useMemo(() => {
        return [...new Set(products.map(item => item.prd_category))];
    }, [products]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, stockStatusFilter]);

    const handleEditProduct = async (prd_id: string, updatedData: any) => {
        try {
            const response = await fetch(`/api/products/${prd_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error('Failed to update product');
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            const response = await fetch(`/api/products?productId=${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            setProducts(prevProducts => prevProducts.filter(p => p.prd_id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Products Management</h1>
                <Link href="/dashboard/products/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </Link>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center animate-fade-in">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <select
                    value={stockStatusFilter}
                    onChange={(e) => setStockStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">Stock Status</option>
                    <option value="in stock">In Stock</option>
                    <option value="low stock">Low Stock</option>
                    <option value="out of stock">Out of Stock</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-400">No products found.</td>
                                </tr>
                            ) : paginatedData.map((item) => (
                                <tr key={item.prd_id} className="hover:bg-blue-50 transition-all duration-150">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-gradient-to-br from-blue-200 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold shadow-inner">
                                                {item.prd_name[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{item.prd_name}</div>
                                                <div className="text-xs text-gray-400">ID: #{item.prd_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.prd_category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-bold">${item.prd_unit_price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-bold">{item.stock} units</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full bg-${item.color}-100 text-${item.color}-800 font-semibold shadow-sm`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button className="text-red-600 hover:text-red-800 font-medium transition">Delete</button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Delete Product</DialogTitle>
                                                        <DialogDescription>
                                                            Are you sure you want to delete this product? This action cannot be undone.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter className="flex gap-2">
                                                        <DialogClose asChild>
                                                            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                                                                Cancel
                                                            </button>
                                                        </DialogClose>
                                                        <DialogClose asChild>
                                                            <button
                                                                onClick={() => handleDeleteProduct(item.prd_id)}
                                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div className="text-sm text-gray-500">
                    Showing {startItem} to {endItem} of {filteredData.length} products
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg ${currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
} 