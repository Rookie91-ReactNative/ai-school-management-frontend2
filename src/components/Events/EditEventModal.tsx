import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import {
    eventService,
    EventType,
    /*EventStatus,*/
    EventTypeLabels,
    /*EventStatusLabels,*/
    type EventUpdateDto,
    type ActivityEvent
} from '../../services/eventService';
import { ActivityType, ActivityTypeLabels } from '../../services/teamService';
import { teacherService, type Teacher } from '../../services/teacherService';

interface EditEventModalProps {
    event: ActivityEvent;
    onClose: () => void;
    onSuccess: () => void;
}

// ✅ Helper function to format time from "HH:MM:SS" to "HH:MM"
const formatTimeForInput = (time: string | undefined): string => {
    if (!time) return '';
    // If time is already in HH:MM format, return as is
    if (time.length === 5) return time;
    // If time is in HH:MM:SS format, remove seconds
    if (time.length === 8) return time.substring(0, 5);
    return time;
};

const EditEventModal = ({ event, onClose, onSuccess }: EditEventModalProps) => {
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // ✅ FIXED: Format times properly for HTML time inputs
    const [formData, setFormData] = useState<EventUpdateDto>({
        eventName: event.eventName,
        eventCode: event.eventCode,
        eventType: event.eventType,
        activityType: event.activityType,
        status: event.status,
        eventDate: event.eventDate.split('T')[0],
        startTime: formatTimeForInput(event.startTime),  // ✅ Format time
        endTime: formatTimeForInput(event.endTime),      // ✅ Format time
        venue: event.venue,
        venueAddress: event.venueAddress,
        leadingTeacherID: event.leadingTeacherID,
        result: event.result,
        awardsReceived: event.awardsReceived,
        remarks: event.remarks
    });

    useEffect(() => {
        loadData();
    }, []);

    // ✅ useEffect to handle success state and auto-close
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                onSuccess();
            }, 2000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [success, onSuccess]);

    const loadData = async () => {
        try {
            const teachersData = await teacherService.getAllTeachers(true);
            setTeachers(teachersData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.eventName?.trim()) {
            setError('Event name is required');
            return;
        }

        if (!formData.eventCode?.trim()) {
            setError('Event code is required');
            return;
        }

        if (!formData.venue?.trim()) {
            setError('Venue is required');
            return;
        }

        try {
            setLoading(true);
            await eventService.updateEvent(event.eventID, formData);
            setLoading(false);
            setSuccess(true);
        } catch (error) {
            setLoading(false);
            console.error('Error updating event:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: unknown; status?: number } };
                console.error('Response data:', axiosError.response?.data);
                console.error('Response status:', axiosError.response?.status);
            }

            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Failed to update event';
            setError(errorMessage || 'Failed to update event');
        }
    };

    const handleChange = <K extends keyof EventUpdateDto>(field: K, value: EventUpdateDto[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* ✅ Header with Success Alert */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 shadow-sm">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 flex-shrink-0">Edit Event</h2>

                        {/* ✅ Success Alert in Header - Always Visible */}
                        {success && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-500 rounded-lg shadow-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-green-900 whitespace-nowrap">Event updated successfully!</p>
                                    <p className="text-xs text-green-700 whitespace-nowrap">Closing in 2 seconds...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-4"
                        disabled={loading || success}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Error Alert */}
                    {error && !success && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        </div>

                        {/* Event Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Name *
                            </label>
                            <input
                                type="text"
                                value={formData.eventName || ''}
                                onChange={(e) => handleChange('eventName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Inter-School Football Championship"
                                required
                                disabled={loading || success}
                            />
                        </div>

                        {/* Event Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Code *
                            </label>
                            <input
                                type="text"
                                value={formData.eventCode || ''}
                                onChange={(e) => handleChange('eventCode', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., COMP-2024-001"
                                required
                                disabled={loading || success}
                            />
                        </div>

                        {/* Event Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Type *
                            </label>
                            <select
                                value={formData.eventType ?? EventType.Training}
                                onChange={(e) => handleChange('eventType', Number(e.target.value) as EventType)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={loading || success}
                            >
                                {Object.entries(EventTypeLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Activity Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Activity Type *
                            </label>
                            <select
                                value={formData.activityType ?? ActivityType.Football}
                                onChange={(e) => handleChange('activityType', Number(e.target.value) as ActivityType)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={loading || success}
                            >
                                {Object.entries(ActivityTypeLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Leading Teacher */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Leading Teacher *
                            </label>
                            <select
                                value={formData.leadingTeacherID || ''}
                                onChange={(e) => handleChange('leadingTeacherID', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={loading || success}
                            >
                                <option value="">Select a teacher</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.teacherID} value={teacher.teacherID}>
                                        {teacher.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date & Time */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-4">Date & Time</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                Event Date *
                            </label>
                            <input
                                type="date"
                                value={formData.eventDate || ''}
                                onChange={(e) => handleChange('eventDate', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={loading || success}
                            />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                Start Time *
                            </label>
                            <input
                                type="time"
                                value={formData.startTime || ''}
                                onChange={(e) => handleChange('startTime', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={loading || success}
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                End Time (Optional)
                            </label>
                            <input
                                type="time"
                                value={formData.endTime || ''}
                                onChange={(e) => handleChange('endTime', e.target.value || undefined)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={loading || success}
                            />
                        </div>

                        {/* Location */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-4">Location</h3>
                        </div>

                        {/* Venue */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                Venue *
                            </label>
                            <input
                                type="text"
                                value={formData.venue || ''}
                                onChange={(e) => handleChange('venue', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., School Sports Complex"
                                required
                                disabled={loading || success}
                            />
                        </div>

                        {/* Venue Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Venue Address (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.venueAddress || ''}
                                onChange={(e) => handleChange('venueAddress', e.target.value || undefined)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Full address of the venue"
                                disabled={loading || success}
                            />
                        </div>

                        {/* Additional Information */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-4">Additional Information</h3>
                        </div>

                        {/* Result */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Result (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.result || ''}
                                onChange={(e) => handleChange('result', e.target.value || undefined)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Won 3-1, 2nd Place"
                                disabled={loading || success}
                            />
                        </div>

                        {/* Awards Received */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Awards Received (Optional)
                            </label>
                            <textarea
                                value={formData.awardsReceived || ''}
                                onChange={(e) => handleChange('awardsReceived', e.target.value || undefined)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 1st Place - District Level, Best Team Award, Champion Trophy"
                                disabled={loading || success}
                            />
                        </div>

                        {/* Remarks / Suggestions */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remarks / Suggestions (Optional)
                            </label>
                            <textarea
                                value={formData.remarks || ''}
                                onChange={(e) => handleChange('remarks', e.target.value || undefined)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Suggestions for improvement, lessons learned, recommendations..."
                                disabled={loading || success}
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading || success}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                            disabled={loading || success}
                        >
                            {loading ? 'Updating...' : success ? '✓ Updated!' : 'Update Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEventModal;