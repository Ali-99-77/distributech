"use client"

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';
import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useUser } from '@/context/UserContext';

interface Shipment {
    shp_id: string;
    usr_id: string;
    shp_request_date: string;
    shp_status: string;
    shp_location: string;
    shp_comment?: string;
    usr_username: string;
    usr_email: string;
    items: ShipmentItem[];
}

interface ShipmentItem {
    shp_item_id: string;
    shp_item_quantity: number;
    shp_unit_price: string;
    product: {
        prd_id: string;
        prd_name: string;
        prd_description: string;
        prd_unit_price: string;
    };
}

interface User {
    usr_id: string;
    role: string;
    retailer?: string;
}

export default function ShipmentsPage() {
    const user = useUser() as User;
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/shipments');
                if (!response.ok) {
                    throw new Error('Failed to fetch shipments');
                }
                const result = await response.json();
                if (result.success) {
                    setShipments(result.data);
                } else {
                    throw new Error('Failed to fetch shipments');
                }
            } catch (error) {
                console.error('Error fetching shipments:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchShipments();
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [retailerFilter, setRetailerFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const filteredData = useMemo(() => {
        let data = shipments;
        if (user.role === 'retailer') {
            data = data.filter(item => item.usr_id === user.usr_id);
        }
        return data.filter(item => {
            const matchesSearch = item.shp_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.usr_username.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = !statusFilter || item.shp_status.toLowerCase() === statusFilter.toLowerCase();
            const matchesRetailer = !retailerFilter || item.usr_username.toLowerCase() === retailerFilter.toLowerCase();
            const matchesDate = !dateFilter || item.shp_request_date === dateFilter;
            return matchesSearch && matchesStatus && matchesRetailer && matchesDate;
        });
    }, [searchQuery, statusFilter, retailerFilter, dateFilter, shipments, user]);

    const retailers = useMemo(() => {
        return [...new Set(shipments.map(item => item.usr_username))];
    }, [shipments]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            if (a.shp_status === 'Pending' && b.shp_status !== 'Pending') return -1;
            if (a.shp_status !== 'Pending' && b.shp_status === 'Pending') return 1;
            return 0;
        });
    }, [filteredData]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, retailerFilter, dateFilter]);

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addType, setAddType] = useState<'retailer' | 'distributor' | null>(null);
    const [addSuccess, setAddSuccess] = useState(false);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shipments Management</h1>
                <div className="flex gap-3">
                    {user.role === 'admin' && (
                        <>
                            <button
                                className="border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition flex items-center gap-2"
                                onClick={() => { setAddType('retailer'); setAddModalOpen(true); }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Retailer
                            </button>
                        </>
                    )}
                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                                hidden={user.role !== 'retailer'}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                New Shipment
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>New Shipment</DialogTitle>
                                <DialogDescription>
                                    Fill in the details below to create a new shipment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[80vh] overflow-y-auto w-full p-1">
                                <NewShipmentForm user={{ role: user.role, retailer: user.retailer || '', usr_id: user.usr_id }} />
                            </div>
                            <DialogClose asChild>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mt-4">Close</button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Shipments", value: "156", change: "+12%", color: "blue" },
                    { label: "Pending Approval", value: "23", change: "5 urgent", color: "yellow" },
                    { label: "In Transit", value: "45", change: "On track", color: "green" },
                    { label: "Delivered", value: "88", change: "This month", color: "purple" }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800">{stat.label}</h3>
                        <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                    </div>
                ))}
            </div> */}

            {/* Filters */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center animate-fade-in">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search shipments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                </select>
                <select
                    value={retailerFilter}
                    onChange={(e) => setRetailerFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">All Retailers</option>
                    {retailers.map(retailer => (
                        <option key={retailer} value={retailer}>{retailer}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
            </div>

            {/* Shipments Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Shipment ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Retailer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Request Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-400">No shipments found.</td>
                                </tr>
                            ) : paginatedData.map((shipment) => (
                                <tr
                                    key={shipment.shp_id}
                                    className={`transition-all duration-150 ${shipment.shp_status === 'Pending'
                                        ? 'bg-yellow-50 border-l-4 border-yellow-400'
                                        : 'hover:bg-blue-50'
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-gradient-to-br from-blue-200 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold shadow-inner">
                                                {shipment.shp_id[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{shipment.shp_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{shipment.usr_username}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-bold">
                                        <ul>
                                            {shipment.items.map(item => (
                                                <li key={item.shp_item_id}>
                                                    {item.product.prd_name} ({item.shp_item_quantity} units @ {item.product.prd_unit_price})
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-semibold shadow-sm ${shipment.shp_status === 'Pending'
                                            ? 'bg-yellow-200 text-yellow-900 border border-yellow-400'
                                            : shipment.shp_status === 'In Transit'
                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                                            }`}>
                                            {shipment.shp_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-bold">{shipment.shp_request_date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/dashboard/shipments/${shipment.shp_id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium transition"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div className="text-sm text-gray-500">
                    Showing {startItem} to {endItem} of {filteredData.length} shipments
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

            {/* Add Retailer/Distributor Modal */}
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{addType === 'retailer' ? 'Add Retailer' : 'Add Distributor'}</DialogTitle>
                        <DialogDescription>
                            {addType === 'retailer' ? 'Enter the details for the new retailer.' : 'Enter the details for the new distributor.'}
                        </DialogDescription>
                    </DialogHeader>
                    {addSuccess ? (
                        <div className="text-green-600 font-semibold text-center py-8">{addType === 'retailer' ? 'Retailer' : 'Distributor'} added successfully!</div>
                    ) : (
                        <AddEntityForm type={addType} onSuccess={() => setAddSuccess(true)} />
                    )}
                    <DialogClose asChild>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition mt-4">Close</button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function NewShipmentForm({ user }: { user: { role: string; retailer: string; usr_id: string } }) {
    const [products, setProducts] = useState<Array<{ prd_id: string; prd_name: string; prd_unit_price: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [requestDate, setRequestDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [location, setLocation] = useState('');
    const [comment, setComment] = useState('');
    const [shipmentItems, setShipmentItems] = useState<Array<{ prd_id: string; quantity: number }>>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const productsResponse = await fetch('/api/products');
                if (!productsResponse.ok) throw new Error('Failed to fetch products');
                const productsData = await productsResponse.json();
                setProducts(productsData.data);

                if (productsData.data.length > 0) {
                    setShipmentItems([{
                        prd_id: productsData.data[0].prd_id,
                        quantity: 1
                    }]);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load form data');
                console.error('Error loading form data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleItemChange = (idx: number, field: string, value: string | number) => {
        setShipmentItems(items => items.map((item, i) => {
            if (i !== idx) return item;
            if (field === 'prd_id') {
                return { ...item, prd_id: value as string };
            }
            if (field === 'quantity') {
                return { ...item, quantity: Number(value) };
            }
            return item;
        }));
    };

    const addItem = () => {
        if (products.length > 0) {
            setShipmentItems(items => [...items, {
                prd_id: products[0].prd_id,
                quantity: 1
            }]);
        }
    };

    const removeItem = (idx: number) => {
        setShipmentItems(items => items.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setError(null);
            const response = await fetch('/api/shipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usr_id: user.usr_id,
                    shp_request_date: `${requestDate} 12:00:00`,
                    shp_status: 'PENDING',
                    shp_location: location,
                    shp_comment: comment,
                    products: shipmentItems
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create shipment');
            }

            const successData = await response.json();
            console.log('Shipment created successfully:', successData);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create shipment');
            console.error('Error creating shipment:', err);
        }
    };

    if (isLoading) {
        return <div className="text-center py-4">Loading form data...</div>;
    }

    if (error) {
        return <div className="text-red-600 py-4">{error}</div>;
    }

    return (
        <form className="space-y-4 mt-2 w-full" onSubmit={handleSubmit} style={{ boxSizing: 'border-box' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="w-full">
                    <label className="block text-sm font-medium mb-1">Request Date</label>
                    <input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="w-full">
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>
            <div className="w-full">
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="w-full">
                <label className="block text-sm font-medium mb-1">Shipment Items</label>
                <div className="space-y-2 w-full">
                    {shipmentItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-2 items-center w-full">
                            <select
                                value={item.prd_id}
                                onChange={e => handleItemChange(idx, 'prd_id', e.target.value)}
                                className="px-2 py-1 border rounded-lg w-full md:w-auto"
                            >
                                {products.map(p => (
                                    <option key={p.prd_id} value={p.prd_id}>
                                        {p.prd_name} - {p.prd_unit_price}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                className="w-full md:w-20 px-2 py-1 border rounded-lg"
                                placeholder="Qty"
                            />
                            {shipmentItems.length > 1 && (
                                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addItem} className="text-blue-600 hover:underline text-sm mt-1">+ Add Item</button>
                </div>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mt-2 w-full md:w-auto">Create Shipment</button>
        </form>
    );
}

function AddEntityForm({ type, onSuccess }: { type: 'retailer' | 'distributor' | null, onSuccess: () => void }) {
    const [form, setForm] = useState({
        userData: {
            usr_email: '',
            usr_fname: '',
            usr_lname: '',
            usr_username: ''
        },
        retailerData: {
            rtl_store_name: '',
            rtl_business_number: ''
        },
        distributorData: {
            distributionArea: '',
            plateNumber: ''
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        setForm(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof form],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const endpoint = type === 'retailer' ? '/api/retailers' : '/api/distributors';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (!response.ok) throw new Error(`Failed to add ${type}`);
            onSuccess();
        } catch (error) {
            console.error(`Error adding ${type}:`, error);
        }
    };

    if (!type) return null;

    if (type === 'retailer') {
        return (
            <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">User Information</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="userData.usr_email"
                            value={form.userData.usr_email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                            name="userData.usr_fname"
                            value={form.userData.usr_fname}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                            name="userData.usr_lname"
                            value={form.userData.usr_lname}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            name="userData.usr_username"
                            value={form.userData.usr_username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Retailer Information</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Store Name</label>
                        <input
                            name="retailerData.rtl_store_name"
                            value={form.retailerData.rtl_store_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Business Number</label>
                        <input
                            name="retailerData.rtl_business_number"
                            value={form.retailerData.rtl_business_number}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full">
                    Add Retailer
                </button>
            </form>
        );
    }

    return (
        <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium mb-1">Distribution Area</label>
                <input
                    name="distributorData.distributionArea"
                    value={form.distributorData.distributionArea}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Plate Number</label>
                <input
                    name="distributorData.plateNumber"
                    value={form.distributorData.plateNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full">Add Distributor</button>
        </form>
    );
} 