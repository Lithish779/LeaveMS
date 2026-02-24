import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { useState } from 'react';

const ReceiptPreviewModal = ({ url, isOpen, onClose }) => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    if (!isOpen) return null;

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
                    <h3 className="text-white font-semibold">Receipt Preview</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handleZoomOut} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <ZoomOut size={18} />
                        </button>
                        <button onClick={handleZoomIn} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <ZoomIn size={18} />
                        </button>
                        <button onClick={handleRotate} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <RotateCw size={18} />
                        </button>
                        <a
                            href={url}
                            download
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Download size={18} />
                        </a>
                        <div className="w-px h-6 bg-slate-800 mx-2" />
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-950/50">
                    <div className="transition-transform duration-200 ease-out" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}>
                        <img
                            src={url}
                            alt="Receipt"
                            className="max-w-full h-auto rounded shadow-2xl"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Quick View Mode
                </div>
            </div>
        </div>
    );
};

export default ReceiptPreviewModal;
