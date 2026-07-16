import React from 'react';
import { Filter, X } from 'lucide-react';

const FilterSort = ({ filters, onFilterChange, totalCount, filteredCount }) => {
  const handleFilterChange = (key, value) => {
    if (typeof onFilterChange === 'function') {
      onFilterChange({ [key]: value });
    }
  };

  const handleClearFilters = () => {
    if (typeof onFilterChange === 'function') {
      onFilterChange({
        status: 'all',
        priority: 'all',
        dateRange: 'all',
        sortBy: 'date',
        sortOrder: 'desc'
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Filter & Sort</h3>
        </div>
        <div className="px-3 py-1 bg-muted/50 rounded-full text-xs font-semibold text-muted-foreground border border-border/50">
          Showing <span className="text-foreground">{filteredCount}</span> of {totalCount}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status-filter" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Status</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="h-9 px-3 rounded-xl bg-muted/30 border border-border/80 focus:border-primary outline-none transition-all text-xs font-medium appearance-none cursor-pointer w-full hover:bg-muted/50"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="priority-filter" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Priority</label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="h-9 px-3 rounded-xl bg-muted/30 border border-border/80 focus:border-primary outline-none transition-all text-xs font-medium appearance-none cursor-pointer w-full hover:bg-muted/50"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="date-filter" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Date Range</label>
          <select
            id="date-filter"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="h-9 px-3 rounded-xl bg-muted/30 border border-border/80 focus:border-primary outline-none transition-all text-xs font-medium appearance-none cursor-pointer w-full hover:bg-muted/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="sort-filter" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Sort By</label>
          <select
            id="sort-filter"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="h-9 px-3 rounded-xl bg-muted/30 border border-border/80 focus:border-primary outline-none transition-all text-xs font-medium appearance-none cursor-pointer w-full hover:bg-muted/50"
          >
            <option value="date">Date Created</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="order-filter" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Order</label>
          <select
            id="order-filter"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="h-9 px-3 rounded-xl bg-muted/30 border border-border/80 focus:border-primary outline-none transition-all text-xs font-medium appearance-none cursor-pointer w-full hover:bg-muted/50"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 justify-end">
          <button 
            className="h-9 w-full flex items-center justify-center gap-1.5 rounded-xl bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors text-xs font-semibold"
            onClick={handleClearFilters}
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSort;