'use client';
import { useState, useEffect, useMemo } from 'react';
import { Calendar, Milk, Scale, Filter, ChevronDown, AlertCircle, Edit, Trash2, Download, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import { StatStrip } from '@/components/ui/StatStrip';
import { Table } from '@/components/ui/Table/Table';
import { Select } from '@/components/ui/Select';
import MilkLoader from '@/components/ui/Loader';
import { 
  fetchMyDodhiId, 
  fetchDodhiDashboardRecords, 
  PurchaseRecord, 
  ReceiveRecord,
  DodhiDashboardRecords
} from '@/lib/api/reports';
import { getChillars, Chillar } from '@/lib/api/chillar';
import { getEmployees, Employee } from '@/lib/api/employees';

interface PurchaseSummary {
  totalPurchased: number;
  totalReceived: number;
  difference: number;
  totalTransactions: number;
  uniqueSuppliers: number;
}

export default function PurchaseReport() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<string>('today');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // API State
  const [dodhiId, setDodhiId] = useState<number | null>(null);
  const [selectedChillarId, setSelectedChillarId] = useState<number | undefined>(undefined);
  const [selectedDodhiId, setSelectedDodhiId] = useState<number | undefined>(undefined);
  const [chillars, setChillars] = useState<Chillar[]>([]);
  const [allDodhis, setAllDodhis] = useState<Employee[]>([]);
  const [filteredDodhis, setFilteredDodhis] = useState<Employee[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [receives, setReceives] = useState<ReceiveRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for editing receives
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [editingReceive, setEditingReceive] = useState<ReceiveRecord | null>(null);

  // Load chillars and dodhis for admin
  useEffect(() => {
    const loadData = async () => {
      if (isAdmin) {
        try {
          const [chillarData, dodhiData] = await Promise.all([
            getChillars(),
            getEmployees()
          ]);
          setChillars(chillarData);
          setAllDodhis(dodhiData);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      }
    };

    loadData();
  }, [isAdmin]);

  // Filter dodhis based on selected chillar
  useEffect(() => {
    if (selectedChillarId) {
      const filtered = allDodhis.filter(dodhi => dodhi.chillarId === selectedChillarId);
      setFilteredDodhis(filtered);
      // Reset dodhi selection when chillar changes
      setSelectedDodhiId(undefined);
    } else {
      setFilteredDodhis(allDodhis);
    }
  }, [selectedChillarId, allDodhis]);

  // Fetch dodhi ID on component mount for non-admin users
  useEffect(() => {
    const fetchDodhiId = async () => {
      if (!isAdmin) {
        try {
          const id = await fetchMyDodhiId();
          setDodhiId(id);
        } catch (error) {
          console.error('Error fetching dodhi ID:', error);
          setError('Failed to fetch dodhi information');
          setLoading(false);
        }
      }
    };

    fetchDodhiId();
  }, [isAdmin]);

  // Calculate date ranges
  useEffect(() => {
    const today = new Date();
    const newEndDate = today.toISOString().split('T')[0];

    if (dateRange === 'today') {
      setStartDate(newEndDate);
      setEndDate(newEndDate);
    } else if (dateRange === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
      setEndDate(newEndDate);
    } else if (dateRange === '15days') {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(today.getDate() - 15);
      setStartDate(fifteenDaysAgo.toISOString().split('T')[0]);
      setEndDate(newEndDate);
    }
  }, [dateRange]);

  // Fetch records when filters change
  useEffect(() => {
    const fetchRecords = async () => {
      if (!isAdmin && !dodhiId) return;
      if (isAdmin && selectedChillarId && !selectedDodhiId) {
        // If chillar is selected but no dodhi, don't fetch yet
        setPurchases([]);
        setReceives([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const targetDodhiId = isAdmin ? selectedDodhiId : dodhiId;
        
        if (isAdmin && !targetDodhiId) {
          // No specific dodhi selected for admin
          setPurchases([]);
          setReceives([]);
        } else {
          const data: DodhiDashboardRecords = await fetchDodhiDashboardRecords({
            startDate,
            endDate,
            dodhiId: targetDodhiId!
          });

          setPurchases(data.purchases || []);
          setReceives(data.receives || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard records:', error);
        setError('Failed to fetch dashboard records');
        setPurchases([]);
        setReceives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [dodhiId, startDate, endDate, isAdmin, selectedChillarId, selectedDodhiId]);

  // Calculate totals and summary
  const purchaseSummary: PurchaseSummary = useMemo(() => {
    const totalPurchased = purchases.reduce((sum, p) => sum + p.grossLiters, 0);
    const totalReceived = receives.reduce((sum, r) => sum + r.grossLiters, 0);
    const difference = totalReceived - totalPurchased;
    const totalTransactions = purchases.length + receives.length;
    const uniqueSuppliers = new Set(purchases.map(p => p.accountId)).size;

    return {
      totalPurchased,
      totalReceived,
      difference,
      totalTransactions,
      uniqueSuppliers
    };
  }, [purchases, receives]);

  // Handle receive edit
  const handleEditReceive = (receive: ReceiveRecord) => {
    setEditingReceive(receive);
    setIsReceiveModalOpen(true);
  };

  // Handle receive delete
  const handleDeleteReceive = (receiveId: number) => {
    if (window.confirm('Are you sure you want to delete this receive record?')) {
      // Implement delete functionality
      console.log('Delete receive:', receiveId);
      // After successful delete, refresh the records
    }
  };

  // Handle receive modal submit
  const handleReceiveModalSubmit = (data: any) => {
    console.log('Update receive data:', data);
    // Implement update functionality
    setIsReceiveModalOpen(false);
    setEditingReceive(null);
    // After successful update, refresh the records
  };

  // Handle export data
  const handleExportData = () => {
    const headers = [
      'Type',
      'Date',
      'Time',
      'Account Code',
      'Account Name',
      'Gross Liters',
      'LR',
      'Fat',
      'Net Liters'
    ];

    const csvContent = [
      headers.join(','),
      ...purchases.map(purchase => [
        'Purchase',
        purchase.date,
        purchase.timeOfDay,
        purchase.accountCode,
        `"${purchase.accountName}"`,
        purchase.grossLiters,
        '',
        '',
        ''
      ].join(',')),
      ...receives.map(receive => [
        'Receive',
        receive.date,
        receive.timeOfDay,
        '',
        '',
        receive.grossLiters,
        receive.lr,
        receive.fat,
        receive.netLiters
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-report-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get current selected dodhi and chillar names for display
  const selectedChillarName = selectedChillarId 
    ? chillars.find(c => c.chillarId === selectedChillarId)?.name 
    : null;

  const selectedDodhiName = selectedDodhiId 
    ? filteredDodhis.find(d => d.employeeId === selectedDodhiId)?.fullName 
    : null;

  if (loading && (!dodhiId && !isAdmin)) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'dodhi']}>
        <DynamicLayout>
          <div className="max-w-6xl mx-auto p-1 bg-gray-50 min-h-screen flex items-center justify-center">
            <MilkLoader />
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  if (error && (!dodhiId && !isAdmin)) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'dodhi']}>
        <DynamicLayout>
          <div className="max-w-6xl mx-auto p-1 bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'dodhi']}>
      <DynamicLayout>
        <div className="max-w-6xl mx-auto p-1 sm:p-4 bg-gray-50 min-h-screen space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                <Calendar className="w-6 h-6" />
                Purchase Report
              </h1>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Date Range Selector */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center justify-between w-full bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm text-left"
                >
                  <span>
                    {dateRange === 'today' && 'Today'}
                    {dateRange === '7days' && 'Last 7 Days'}
                    {dateRange === '15days' && 'Last 15 Days'}
                    {dateRange === 'custom' && 'Custom Range'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDatePicker && (
                  <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-full">
                    <button
                      onClick={() => { setDateRange('today'); setShowDatePicker(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md ${dateRange === 'today' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => { setDateRange('7days'); setShowDatePicker(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md ${dateRange === '7days' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => { setDateRange('15days'); setShowDatePicker(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md ${dateRange === '15days' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    >
                      Last 15 Days
                    </button>
                    <div className="border-t border-gray-200 mt-1 pt-1">
                      <div className="px-3 py-2 text-sm text-gray-500">Custom Range</div>
                      <div className="px-3 pb-2 flex flex-col gap-2">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => { setStartDate(e.target.value); setDateRange('custom'); }}
                          className="border border-gray-300 rounded-md p-1 text-sm"
                        />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => { setEndDate(e.target.value); setDateRange('custom'); }}
                          className="border border-gray-300 rounded-md p-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chillar Selection - Only for Admin */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chillar</label>
                  <Select
                    value={selectedChillarId?.toString() || ''}
                    onChange={(value) => setSelectedChillarId(value ? Number(value) : undefined)}
                    options={[
                      { value: '', label: 'All Chillars' },
                      ...chillars.map(chillar => ({
                        value: chillar.chillarId.toString(),
                        label: chillar.name
                      }))
                    ]}
                  />
                </div>
              )}

              {/* Dodhi Selection - Only for Admin */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dodhi</label>
                  <Select
                    value={selectedDodhiId?.toString() || ''}
                    onChange={(value) => setSelectedDodhiId(value ? Number(value) : undefined)}
                    options={[
                      { value: '', label: selectedChillarId ? 'All Dodhis in Chillar' : 'All Dodhis' },
                      ...filteredDodhis.map(dodhi => ({
                        value: dodhi.employeeId.toString(),
                        label: dodhi.fullName
                      }))
                    ]}
                    disabled={!selectedChillarId && filteredDodhis.length === 0}
                  />
                </div>
              )}

              {/* Date Display */}
              <div className="flex items-end">
                <div className="text-sm bg-white px-4 py-2 rounded-lg border border-gray-200 w-full">
                  {startDate === endDate ? (
                    <span>{new Date(startDate).toLocaleDateString()}</span>
                  ) : (
                    <span>
                      {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {isAdmin ? (
                    <>
                      {selectedChillarName && selectedDodhiName && (
                        <span>Viewing data for <span className="font-semibold text-blue-600">{selectedDodhiName}</span> in <span className="font-semibold text-green-600">{selectedChillarName}</span></span>
                      )}
                      {selectedChillarName && !selectedDodhiName && (
                        <span>Select a dodhi from <span className="font-semibold text-green-600">{selectedChillarName}</span> to view data</span>
                      )}
                      {!selectedChillarName && selectedDodhiName && (
                        <span>Viewing data for <span className="font-semibold text-blue-600">{selectedDodhiName}</span></span>
                      )}
                      {!selectedChillarName && !selectedDodhiName && (
                        <span>Select a chillar and dodhi to view specific data</span>
                      )}
                    </>
                  ) : (
                    <span>Viewing your purchase data</span>
                  )}
                  <span className="ml-2">• {purchases.length + receives.length} records</span>
                </div>
              </div>
            )}
          </div>

          {/* Loading indicator for data refresh */}
          {loading && (dodhiId || isAdmin) && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Loading records...</span>
            </div>
          )}

          {/* Error message */}
          {error && (dodhiId || isAdmin) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Summary Strip */}
          {(!isAdmin || selectedDodhiId) && (
            <StatStrip
              items={[
                {
                  label: 'Total Purchased',
                  value: `${purchaseSummary.totalPurchased.toFixed(2)} L`,
                  subtext: `${purchaseSummary.uniqueSuppliers} suppliers`,
                  color: 'info',
                  icon: <Milk className="w-4 h-4 text-blue-600" />,
                },
                {
                  label: 'Total Received',
                  value: `${purchaseSummary.totalReceived.toFixed(2)} L`,
                  subtext: `${receives.length} receive records`,
                  color: 'success',
                  icon: <Scale className="w-4 h-4 text-emerald-600" />,
                },
                {
                  label: 'Difference',
                  value: `${purchaseSummary.difference >= 0 ? '+' : ''}${purchaseSummary.difference.toFixed(2)} L`,
                  subtext: `${purchases.length} purchases`,
                  color: purchaseSummary.difference >= 0 ? 'warning' : 'danger',
                  icon: <Users className="w-4 h-4 text-amber-600" />,
                },
              ]}
            />
          )}

          {/* Purchase Records */}
          {(!isAdmin || selectedDodhiId) && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                  <Milk className="w-4 h-4" />
                  Purchase Records
                </h2>
                <span className="text-xs text-slate-500">{purchases.length} records</span>
              </div>

              {purchases.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table dense>
                      <Table.Header sticky>
                        <Table.Row>
                          <Table.Head dense>Date</Table.Head>
                          <Table.Head dense>Account Code</Table.Head>
                          <Table.Head dense>Account Name</Table.Head>
                          <Table.Head dense>Time</Table.Head>
                          <Table.Head dense className="text-right">Liters</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {purchases.map((purchase) => (
                          <Table.Row key={purchase.purchaseId}>
                            <Table.Cell dense>
                              {new Date(purchase.date).toLocaleDateString()}
                            </Table.Cell>
                            <Table.Cell dense className="font-mono text-xs">
                              {purchase.accountCode}
                            </Table.Cell>
                            <Table.Cell dense className="font-medium text-slate-900">
                              {purchase.accountName}
                            </Table.Cell>
                            <Table.Cell dense className="capitalize">
                              {purchase.timeOfDay}
                            </Table.Cell>
                            <Table.Cell dense className="text-right font-medium text-slate-900 tabular-nums">
                              {purchase.grossLiters.toFixed(2)} L
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>

                  {/* Mobile Card List */}
                  <div className="md:hidden space-y-2">
                    {purchases.map((purchase) => (
                      <div key={purchase.purchaseId} className="bg-slate-50/70 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{purchase.accountName}</span>
                            <span className="text-[11px] text-slate-500 font-mono ml-1.5">#{purchase.accountCode}</span>
                          </div>
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 capitalize">
                            {purchase.timeOfDay}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 text-[11px]">{new Date(purchase.date).toLocaleDateString()}</span>
                          <span className="font-medium text-slate-900 tabular-nums text-sm">{purchase.grossLiters.toFixed(2)} L</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No purchase records found for selected filters
                </div>
              )}
            </div>
          )}

          {/* Receive Records */}
          {(!isAdmin || selectedDodhiId) && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-emerald-600">
                  <Scale className="w-4 h-4" />
                  Receive Records
                </h2>
                <span className="text-xs text-slate-500">{receives.length} records</span>
              </div>

              {receives.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table dense>
                      <Table.Header sticky>
                        <Table.Row>
                          <Table.Head dense>Date</Table.Head>
                          <Table.Head dense>Time</Table.Head>
                          <Table.Head dense className="text-right">Gross Ltrs</Table.Head>
                          <Table.Head dense className="text-right">LR</Table.Head>
                          <Table.Head dense className="text-right">Fat</Table.Head>
                          <Table.Head dense className="text-right">Net Ltrs</Table.Head>
                          <Table.Head dense className="text-right">Actions</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {receives.map((receive) => (
                          <Table.Row key={receive.receiveId}>
                            <Table.Cell dense>
                              {new Date(receive.date).toLocaleDateString()}
                            </Table.Cell>
                            <Table.Cell dense className="capitalize">
                              {receive.timeOfDay}
                            </Table.Cell>
                            <Table.Cell dense className="text-right font-medium text-slate-800 tabular-nums">
                              {receive.grossLiters.toFixed(2)}
                            </Table.Cell>
                            <Table.Cell dense className="text-right tabular-nums text-slate-600">
                              {receive.lr.toFixed(2)}
                            </Table.Cell>
                            <Table.Cell dense className="text-right tabular-nums text-slate-600">
                              {receive.fat.toFixed(2)}
                            </Table.Cell>
                            <Table.Cell dense className="text-right font-medium text-slate-900 tabular-nums">
                              {receive.netLiters.toFixed(2)}
                            </Table.Cell>
                            <Table.Cell dense className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleEditReceive(receive)}
                                  className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                                  title="Edit record"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReceive(receive.receiveId)}
                                  className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>

                  {/* Mobile Card List */}
                  <div className="md:hidden space-y-2">
                    {receives.map((receive) => (
                      <div key={receive.receiveId} className="bg-slate-50/70 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{new Date(receive.date).toLocaleDateString()}</span>
                            <span className="inline-flex px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 capitalize">
                              {receive.timeOfDay}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditReceive(receive)}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReceive(receive.receiveId)}
                              className="p-1 text-slate-500 hover:text-rose-600 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Gross / Net</span>
                            <span className="text-slate-700">{receive.grossLiters.toFixed(2)} L gross</span>
                            <span className="font-bold text-emerald-600 block">{receive.netLiters.toFixed(2)} L net</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Quality</span>
                            <span className="text-slate-700 block">LR: {receive.lr.toFixed(2)}</span>
                            <span className="text-slate-700 block">Fat: {receive.fat.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No receive records found for selected filters
                </div>
              )}
            </div>
          )}

          {/* Info message for admin when no dodhi selected */}
          {isAdmin && !selectedDodhiId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-blue-800">Select a Dodhi to View Data</h3>
              </div>
              <p className="text-blue-600">
                {selectedChillarId 
                  ? `Choose a dodhi from ${selectedChillarName} to view their purchase and receive records.`
                  : 'Select a chillar and then choose a dodhi to view their specific purchase data.'
                }
              </p>
            </div>
          )}

          {/* Receive Edit Modal */}
          {isReceiveModalOpen && editingReceive && (
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4">Edit Receive Record</h2>
                <p className="text-gray-600 mb-4">
                  Editing receive record for {new Date(editingReceive.date).toLocaleDateString()} - {editingReceive.timeOfDay}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsReceiveModalOpen(false);
                      setEditingReceive(null);
                    }}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}