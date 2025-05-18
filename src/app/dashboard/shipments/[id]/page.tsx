"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { use } from 'react';

interface Product {
    shp_item_id: string;
    shp_item_quantity: number;
    shp_unit_price: string;
    warehouseId?: string;
    product: {
        prd_id: string;
        prd_name: string;
        prd_description: string;
        prd_unit_price: string;
    };
}

interface Warehouse {
    id: string;
    name: string;
    availableQuantity: number;
}

interface TimelineEvent {
    status: string;
    date: string;
    description: string;
    completed: boolean;
}

interface Shipment {
    shp_id: string;
    usr_id: string;
    shp_request_date: string;
    shp_status: string;
    shp_location: string;
    shp_comment?: string;
    usr_username: string;
    usr_email: string;
    items: Product[];
}

export default function ShipmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const user = useUser();
    const { id } = use(params);
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([
        { id: '1', name: 'Main Warehouse', availableQuantity: 100 },
        { id: '2', name: 'East Coast Hub', availableQuantity: 75 },
        { id: '3', name: 'West Coast Hub', availableQuantity: 50 },
    ]);
    const [isApprovingShipment, setIsApprovingShipment] = useState(false);

    useEffect(() => {
        const fetchShipmentDetails = async () => {
            try {
                const response = await fetch(`/api/shipments/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch shipment details');
                }
                const result = await response.json();
                if (result.success) {
                    setShipment(result.data);
                } else {
                    throw new Error('Failed to fetch shipment details');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchShipmentDetails();
    }, [id]);

    const handleWarehouseSelect = async (warehouseId: string) => {
        if (!selectedProduct) return;

        try {
            setShipment(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    items: prev.items.map(p =>
                        p.shp_item_id === selectedProduct.shp_item_id
                            ? { ...p, warehouseId }
                            : p
                    )
                };
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            const updatedShipment = shipment;
            if (updatedShipment && updatedShipment.items.every(p => p.warehouseId)) {
                setShipment(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        shp_status: "Ready for Shipping"
                    };
                });
            }

            setShowWarehouseModal(false);
            setSelectedProduct(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setShipment(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    items: prev.items.map(p =>
                        p.shp_item_id === selectedProduct.shp_item_id
                            ? { ...p, warehouseId: undefined }
                            : p
                    )
                };
            });
        }
    };

    const handleApproveShipment = async () => {
        if (!shipment) return;

        setIsApprovingShipment(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            setShipment(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    shp_status: "Approved"
                };
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsApprovingShipment(false);
        }
    };

    const handleUpdateStatus = async (newStatus: 'In Transit' | 'Delivered') => {
        if (!shipment) return;

        setIsUpdatingStatus(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            setShipment(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    shp_status: newStatus
                };
            });

            setShowStatusModal(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    if (!shipment) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600">Shipment not found</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Shipment Details</h1>
                <Link
                    href="/dashboard/shipments"
                    className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Shipments
                </Link>
            </div>

            {/* Shipment Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipment Information</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Shipment ID</p>
                            <p className="font-medium">{shipment.shp_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium text-blue-600">{shipment.shp_status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{shipment.shp_location}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Details</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Retailer</p>
                            <p className="font-medium">{shipment.usr_username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{shipment.usr_email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Request Date</p>
                            <p className="font-medium">{new Date(shipment.shp_request_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <div className="relative group">
                            <button
                                onClick={() => setShowStatusModal(true)}
                                disabled={
                                    isUpdatingStatus ||
                                    !shipment?.items.every(p => p.warehouseId) ||
                                    (shipment?.shp_status !== "Approved" && shipment?.shp_status !== "In Transit")
                                }
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                            </button>
                            {(
                                !shipment?.items.every(p => p.warehouseId) ||
                                (shipment?.shp_status !== "Approved" && shipment?.shp_status !== "In Transit")
                            ) && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {!shipment?.items.every(p => p.warehouseId)
                                            ? "Assign warehouses to all products first"
                                            : shipment?.shp_status === "Delivered"
                                                ? "Shipment is already delivered"
                                                : "Approve the shipment first"}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Products</h3>
                        <button
                            onClick={handleApproveShipment}
                            disabled={isApprovingShipment || !shipment?.items.every(p => p.warehouseId)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isApprovingShipment ? 'Approving...' : 'Approve Shipment'}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {shipment?.items.map((item) => (
                                    <tr key={item.shp_item_id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{item.product.prd_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.shp_item_quantity}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">${item.shp_unit_price}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            ${(item.shp_item_quantity * parseFloat(item.shp_unit_price)).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.warehouseId
                                                ? warehouses.find(w => w.id === item.warehouseId)?.name
                                                : 'Not assigned'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(item);
                                                    setShowWarehouseModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Select Warehouse
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Warehouse Selection Modal */}
            {showWarehouseModal && selectedProduct && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={() => {
                        setShowWarehouseModal(false);
                        setSelectedProduct(null);
                    }} />
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Select Warehouse for {selectedProduct.product.prd_name}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowWarehouseModal(false);
                                    setSelectedProduct(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {warehouses.map(warehouse => (
                                <button
                                    key={warehouse.id}
                                    onClick={() => {
                                        if (warehouse.availableQuantity >= selectedProduct.shp_item_quantity) {
                                            handleWarehouseSelect(warehouse.id);
                                        }
                                    }}
                                    disabled={warehouse.availableQuantity < selectedProduct.shp_item_quantity}
                                    className={`w-full p-3 text-left rounded-lg border transition-colors ${warehouse.availableQuantity >= selectedProduct.shp_item_quantity
                                        ? 'border-gray-200 hover:bg-gray-50'
                                        : 'border-red-200 bg-red-50 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">{warehouse.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Available: {warehouse.availableQuantity} units
                                            </p>
                                        </div>
                                        {warehouse.availableQuantity >= selectedProduct.shp_item_quantity ? (
                                            <span className="text-green-600 text-sm font-medium">Available</span>
                                        ) : (
                                            <span className="text-red-600 text-sm font-medium">Insufficient Stock</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Update Shipment Status
                            </h3>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleUpdateStatus('In Transit')}
                                disabled={isUpdatingStatus}
                                className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">In Transit</p>
                                        <p className="text-sm text-gray-500">
                                            Shipment is currently being transported
                                        </p>
                                    </div>
                                    <span className="text-blue-600 text-sm font-medium">Select</span>
                                </div>
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('Delivered')}
                                disabled={isUpdatingStatus}
                                className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">Delivered</p>
                                        <p className="text-sm text-gray-500">
                                            Shipment has been delivered to the destination
                                        </p>
                                    </div>
                                    <span className="text-blue-600 text-sm font-medium">Select</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 