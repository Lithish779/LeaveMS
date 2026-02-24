import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import { Plus, Trash2, Upload, Scan, Loader2, Save, Send, IndianRupee, DollarSign, Globe } from 'lucide-react';
import reimbursementService from '../../services/reimbursementService';
import toast from 'react-hot-toast';

const CATEGORIES = ['Travel', 'Meals', 'Internet/Wifi', 'Medical', 'Office Supplies', 'Other'];
const CURRENCIES = [
    { code: 'INR', symbol: '₹', rate: 1 },
    { code: 'USD', symbol: '$', rate: 83.5 }, // Example rate
    { code: 'EUR', symbol: '€', rate: 90.2 }, // Example rate
];

const ReimbursementForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [items, setItems] = useState([]);
    const [baseCurrency, setBaseCurrency] = useState('INR');
    const [loading, setLoading] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);

    useEffect(() => {
        if (id) fetchReimbursement();
    }, [id]);

    const fetchReimbursement = async () => {
        try {
            const data = await reimbursementService.getMyReimbursements();
            const found = data.reimbursements.find(r => r._id === id);
            if (found) {
                if (found.status !== 'Draft') {
                    toast.error('Only drafts can be edited');
                    navigate('/reimbursements');
                    return;
                }
                setTitle(found.title);
                setItems(found.items);
            }
        } catch (err) {
            toast.error('Failed to load reimbursement');
        }
    };

    const addItem = () => {
        setItems([...items, { title: '', category: 'Travel', amount: '', currency: 'INR', date: '', receiptUrl: '', isMock: true }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const convertToINR = (amount, currency) => {
        const rate = CURRENCIES.find(c => c.code === currency)?.rate || 1;
        return (parseFloat(amount) || 0) * rate;
    };

    const handleOcr = async (index, file) => {
        if (!file) return;

        setOcrLoading(true);
        toast.loading('Scanning receipt...', { id: 'ocr' });

        // Mocking receipt upload for now (getting a local URL)
        const mockUrl = URL.createObjectURL(file);
        handleItemChange(index, 'receiptUrl', mockUrl);

        try {
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            // Simple OCR parsing logic
            // Look for patterns like "Total: 123.45" or dates
            const amountMatch = text.match(/(?:total|amount|sum|net)\s*[:=]?\s*[\D]*?([\d,.]+)/i);
            const dateMatch = text.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})|(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/);

            if (amountMatch) {
                const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
                if (!isNaN(amount)) handleItemChange(index, 'amount', amount);
            }
            if (dateMatch) {
                // Try to parse the date string (simplified)
                try {
                    const d = new Date(dateMatch[0]);
                    if (!isNaN(d.getTime())) handleItemChange(index, 'date', d.toISOString().split('T')[0]);
                } catch (e) { }
            }

            toast.success('Scan complete', { id: 'ocr' });
        } catch (err) {
            console.error('OCR failed', err);
            toast.error('Scan failed', { id: 'ocr' });
        } finally {
            setOcrLoading(false);
        }
    };

    const handleSubmit = async (status = 'Pending Manager') => {
        if (!title.trim() || items.length === 0) {
            return toast.error('Please enter a title and at least one item');
        }

        setLoading(true);
        try {
            if (id) {
                await reimbursementService.update(id, { title, items, status });
            } else {
                await reimbursementService.apply({ title, items, status });
            }
            toast.success(status === 'Draft' ? 'Draft saved' : 'Claim submitted successfully');
            navigate('/reimbursements');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit claim');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    {id ? <FileText size={24} /> : <Plus size={24} />}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{id ? 'Edit Reimbursement' : 'New Reimbursement'}</h1>
                    <p className="text-slate-400">Claim your business expenses</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="card">
                    <label className="block text-slate-300 text-sm font-medium mb-2">Claim Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Business Trip to London - Oct 2023"
                        className="input-field"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Expense Items</h2>
                        <button onClick={addItem} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-sm">
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    {items.map((item, index) => (
                        <div key={index} className="card relative group">
                            <button
                                onClick={() => removeItem(index)}
                                className="absolute -top-2 -right-2 h-8 w-8 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                            >
                                <Trash2 size={14} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">Description</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                                        className="input-field py-2 text-sm"
                                        placeholder="Lunch with client"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">Category</label>
                                    <select
                                        value={item.category}
                                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                        className="input-field py-2 text-sm"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-1">
                                        <label className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">Curr</label>
                                        <select
                                            value={item.currency}
                                            onChange={(e) => handleItemChange(index, 'currency', e.target.value)}
                                            className="input-field py-2 px-1 text-xs"
                                        >
                                            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">Amount</label>
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                            className="input-field py-2 text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        value={item.date}
                                        onChange={(e) => handleItemChange(index, 'date', e.target.value)}
                                        className="input-field py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="flex items-center justify-center w-full h-10 border border-dashed border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/30 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Upload size={14} className="text-slate-500" />
                                            <span className="text-xs text-slate-400">{item.receiptUrl ? 'Receipt Selected ✅' : 'Upload Receipt'}</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleOcr(index, e.target.files[0])}
                                        />
                                    </label>
                                </div>
                                {ocrLoading && (
                                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium">
                                        <Loader2 size={14} className="animate-spin" />
                                        Scanning...
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <div className="card text-center py-8 border-dashed border-slate-700 bg-slate-800/20">
                            <Plus size={24} className="text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">Click "Add Item" to start your claim</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-700 pt-6">
                    <div className="text-white">
                        <span className="text-slate-400 text-sm mr-2">Total Amount (Estimated INR):</span>
                        <span className="text-xl font-bold">₹{(items.reduce((sum, item) => sum + convertToINR(item.amount, item.currency), 0) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSubmit('Draft')}
                            disabled={loading}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Save size={16} /> Save Draft
                        </button>
                        <button
                            onClick={() => handleSubmit('Pending Manager')}
                            disabled={loading || items.length === 0}
                            className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <Send size={16} /> {id ? 'Update Claim' : 'Submit Claim'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReimbursementForm;
