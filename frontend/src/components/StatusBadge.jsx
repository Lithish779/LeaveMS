const STATUS_CONFIG = {
    Pending: { label: 'Pending', className: 'badge-pending', dot: '●' },
    Approved: { label: 'Approved', className: 'badge-approved', dot: '●' },
    Rejected: { label: 'Rejected', className: 'badge-rejected', dot: '●' },
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
    return (
        <span className={config.className}>
            <span className="text-[8px]">{config.dot}</span>
            {config.label}
        </span>
    );
};

export default StatusBadge;
