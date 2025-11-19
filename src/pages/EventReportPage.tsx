import { useState, useEffect } from 'react';
import { FileDown, Printer, Calendar, Filter, X } from 'lucide-react';
import {
    eventService,
    EventTypeLabels,
    EventStatusLabels,
    type EventWithDetails,
    type EventType,
    type EventStatus
} from '../services/eventService';
//import { ActivityTypeLabels, ActivityType } from '../services/teamService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import * as XLSX from 'xlsx';

// Extended participant type to include gender (which should be added to backend)
interface ParticipantWithGender {
    participantID: number;
    eventID: number;
    studentID: number;
    studentCode: string;
    studentName: string;
    gender?: string;
    grade: string;
    class: string;
    isFromTeam: boolean;
    teamName?: string;
    role: string;
    position?: string;
    attendanceConfirmed: boolean;
    parentConsentReceived: boolean;
    attended: boolean;
    performance?: string;
    remarks?: string;
}

const EventReportPage = () => {
    const [events, setEvents] = useState<EventWithDetails[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<EventWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEventType, setSelectedEventType] = useState<EventType | ''>('');
    const [selectedStatus, setSelectedStatus] = useState<EventStatus | ''>('');
    const [showFilters, setShowFilters] = useState(false);

    // Sorting
    type SortField = 'leadingTeacher' | 'studentName' | 'gender' | 'class' | 'eventName' | 'eventType' | 'remarks' | 'result' | 'achievement' | 'eventDate';
    type SortDirection = 'asc' | 'desc' | null;
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [events, startDate, endDate, selectedEventType, selectedStatus]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            // Load completed events by default
            const data = await eventService.getAllEvents();

            // Load full details for each event
            const eventsWithDetails = await Promise.all(
                data.map(event => eventService.getEventById(event.eventID))
            );

            // Debug: Log the first event to check data structure
            if (eventsWithDetails.length > 0) {
                console.log('First event data:', eventsWithDetails[0]);
                console.log('Leading Teacher:', eventsWithDetails[0].leadingTeacher);
                if (eventsWithDetails[0].participants.length > 0) {
                    console.log('First participant:', eventsWithDetails[0].participants[0]);
                }
            }

            setEvents(eventsWithDetails);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...events];

        if (startDate) {
            filtered = filtered.filter(e => new Date(e.eventDate) >= new Date(startDate));
        }

        if (endDate) {
            filtered = filtered.filter(e => new Date(e.eventDate) <= new Date(endDate));
        }

        if (selectedEventType !== '') {
            filtered = filtered.filter(e => e.eventType === selectedEventType);
        }

        if (selectedStatus !== '') {
            filtered = filtered.filter(e => e.status === selectedStatus);
        }

        setFilteredEvents(filtered);
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedEventType('');
        setSelectedStatus('');
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle direction: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortField(null);
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortedEvents = () => {
        if (!sortField || !sortDirection) {
            return filteredEvents;
        }

        return [...filteredEvents].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            // For participant-specific fields, we'll sort by the first participant
            switch (sortField) {
                case 'leadingTeacher':
                    aValue = a.leadingTeacher?.fullName || '';
                    bValue = b.leadingTeacher?.fullName || '';
                    break;
                case 'studentName':
                    aValue = a.participants[0]?.studentName || '';
                    bValue = b.participants[0]?.studentName || '';
                    break;
                case 'gender':
                    aValue = (a.participants[0] as ParticipantWithGender)?.gender || '';
                    bValue = (b.participants[0] as ParticipantWithGender)?.gender || '';
                    break;
                case 'class':
                    aValue = a.participants[0]?.class || '';
                    bValue = b.participants[0]?.class || '';
                    break;
                case 'eventName':
                    aValue = a.eventName;
                    bValue = b.eventName;
                    break;
                case 'eventType':
                    aValue = EventTypeLabels[a.eventType];
                    bValue = EventTypeLabels[b.eventType];
                    break;
                case 'remarks':
                    aValue = a.remarks || '';
                    bValue = b.remarks || '';
                    break;
                case 'result':
                    aValue = a.result || '';
                    bValue = b.result || '';
                    break;
                case 'achievement':
                    aValue = a.awardsReceived || '';
                    bValue = b.awardsReceived || '';
                    break;
                case 'eventDate':
                    aValue = new Date(a.eventDate).getTime();
                    bValue = new Date(b.eventDate).getTime();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <span className="text-gray-400">⇅</span>;
        }
        return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
    };

    const exportToExcel = () => {
        // Prepare data for Excel
        interface ExcelRow {
            'Leading Teacher': string;
            'Students': string;
            'Gender': string;
            'Class Name': string;
            'Event Name': string;
            'Event Type': string;
            'Remarks/Suggestion': string;
            'Results': string;
            'Achievement': string;
            'Event Date': string;
        }
        const excelData: ExcelRow[] = [];

        filteredEvents.forEach(event => {
            event.participants.forEach((participant) => {
                const participantWithGender = participant as ParticipantWithGender;
                excelData.push({
                    'Leading Teacher': event.leadingTeacher?.fullName || '-',
                    'Students': participant.studentName,
                    'Gender': participantWithGender.gender || '-',
                    'Class Name': participant.class,
                    'Event Name': event.eventName,
                    'Event Type': EventTypeLabels[event.eventType],
                    'Remarks/Suggestion': event.remarks || '',
                    'Results': event.result || '',
                    'Achievement': event.awardsReceived || '',
                    'Event Date': new Date(event.eventDate).toLocaleDateString()
                });
            });
        });

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Leading Teacher
            { wch: 25 }, // Students
            { wch: 10 }, // Gender
            { wch: 12 }, // Class Name
            { wch: 30 }, // Event Name
            { wch: 20 }, // Event Type
            { wch: 30 }, // Remarks
            { wch: 20 }, // Results
            { wch: 25 }, // Achievement
            { wch: 15 }  // Event Date
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Event Report');

        // Generate filename with date
        const filename = `Event_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Event Report</h1>
                    <p className="text-gray-600 mt-1">
                        View and export event details with participants
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        <Filter className="w-4 h-4" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <FileDown className="w-4 h-4" />
                        Export to Excel
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 print:hidden"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Type
                            </label>
                            <select
                                value={selectedEventType}
                                onChange={(e) => setSelectedEventType(e.target.value === '' ? '' : Number(e.target.value) as EventType)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                {Object.entries(EventTypeLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value === '' ? '' : Number(e.target.value) as EventStatus)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                {Object.entries(EventStatusLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-4 h-4" />
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Total Events</p>
                        <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Participants</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {filteredEvents.reduce((sum, e) => sum + e.totalParticipants, 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Date Range</p>
                        <p className="text-sm font-medium text-gray-900">
                            {startDate && endDate
                                ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                                : 'All Dates'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('leadingTeacher')}
                                >
                                    <div className="flex items-center gap-2">
                                        Leading Teacher {getSortIcon('leadingTeacher')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('studentName')}
                                >
                                    <div className="flex items-center gap-2">
                                        Students {getSortIcon('studentName')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('gender')}
                                >
                                    <div className="flex items-center gap-2">
                                        Gender {getSortIcon('gender')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('class')}
                                >
                                    <div className="flex items-center gap-2">
                                        Class Name {getSortIcon('class')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('eventName')}
                                >
                                    <div className="flex items-center gap-2">
                                        Event Name {getSortIcon('eventName')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('eventType')}
                                >
                                    <div className="flex items-center gap-2">
                                        Event Type {getSortIcon('eventType')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('remarks')}
                                >
                                    <div className="flex items-center gap-2">
                                        Remarks/Suggestion {getSortIcon('remarks')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('result')}
                                >
                                    <div className="flex items-center gap-2">
                                        Results {getSortIcon('result')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('achievement')}
                                >
                                    <div className="flex items-center gap-2">
                                        Achievement {getSortIcon('achievement')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('eventDate')}
                                >
                                    <div className="flex items-center gap-2">
                                        Event Date {getSortIcon('eventDate')}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p>No events found</p>
                                    </td>
                                </tr>
                            ) : (
                                getSortedEvents().map(event => (
                                    event.participants.map((participant, index) => {
                                        const participantWithGender = participant as ParticipantWithGender;
                                        return (
                                            <tr key={`${event.eventID}-${participant.studentID}-${index}`} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {event.leadingTeacher?.fullName || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {participant.studentName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {/* Gender data needs to be added to backend EventParticipantDto */}
                                                    {participantWithGender.gender || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {participant.class}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {event.eventName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {EventTypeLabels[event.eventType]}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {event.remarks || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {event.result || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {event.awardsReceived || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                    {new Date(event.eventDate).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    table, table * {
                        visibility: visible;
                    }
                    table {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    );
};

export default EventReportPage;