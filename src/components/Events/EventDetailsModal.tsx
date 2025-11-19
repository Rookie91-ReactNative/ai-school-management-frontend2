import { useState, useEffect } from 'react';
import {
    X, Calendar, /*Clock,*/ MapPin, Users, User, Mail, Phone,
    Edit, Trash2, /*Plus,*/ CheckCircle, /*XCircle,*/ Award, /*AlertCircle,*/ Bell
} from 'lucide-react';
import {
    eventService,
    EventTypeLabels,
    EventStatusLabels,
    EventStatusColors,
    type EventWithDetails
    // ❌ Removed: type EventParticipant
} from '../../services/eventService';
import { ActivityTypeLabels, ActivityType } from '../../services/teamService';
// ❌ Removed: import { studentService } from '../../services/studentService';
import LoadingSpinner from '../Common/LoadingSpinner';
import ManageParticipantsModal from './ManageParticipantsModal';

interface EventDetailsModalProps {
    eventId: number;
    onClose: () => void;
    onEdit: () => void;
}

const EventDetailsModal = ({ eventId, onClose, onEdit }: EventDetailsModalProps) => {
    const [event, setEvent] = useState<EventWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isManageParticipantsOpen, setIsManageParticipantsOpen] = useState(false);
    const [sendingNotification, setSendingNotification] = useState(false);

    useEffect(() => {
        loadEventDetails();
    }, [eventId]);

    const loadEventDetails = async () => {
        try {
            setLoading(true);
            const data = await eventService.getEventById(eventId);

            // 🔍 ADD THIS DEBUG CODE:
            console.log('Event Type Value:', data.eventType);
            console.log('Event Type Label:', EventTypeLabels[data.eventType]);
            console.log('Activity Type Value:', data.activityType);
            console.log('Activity Type Label:', ActivityTypeLabels[data.activityType as ActivityType]);
            console.log('All Activity Labels:', Object.keys(ActivityTypeLabels));

            setEvent(data);
        } catch (error) {
            console.error('Error loading event details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveParticipant = async (participantId: number) => {
        if (!confirm('Are you sure you want to remove this participant?')) return;

        try {
            await eventService.removeParticipant(participantId);
            await loadEventDetails();
        } catch (error) {
            console.error('Error removing participant:', error);
            alert('Failed to remove participant');
        }
    };

    const handleSendNotifications = async () => {
        if (!event) return;

        if (!confirm(`Send parent notifications to all ${event.totalParticipants} participants?`)) return;

        try {
            setSendingNotification(true);
            await eventService.sendParentNotifications(eventId);
            alert('Notifications sent successfully!');
            await loadEventDetails();
        } catch (error) {
            console.error('Error sending notifications:', error);
            alert('Failed to send notifications');
        } finally {
            setSendingNotification(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-MY', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <p className="text-gray-600">Event not found</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{event.eventName}</h2>
                                <p className="text-sm text-gray-500 mt-1">{event.eventCode}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={onEdit}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Event
                            </button>
                            <button
                                onClick={() => setIsManageParticipantsOpen(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Manage Participants
                            </button>
                            {event.requiresParentConsent && !event.parentNotificationSent && (
                                <button
                                    onClick={handleSendNotifications}
                                    disabled={sendingNotification}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:bg-orange-300"
                                >
                                    <Bell className="w-4 h-4" />
                                    {sendingNotification ? 'Sending...' : 'Send Parent Notifications'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Status Badge */}
                        <div className="mb-6">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${EventStatusColors[event.status]}`}>
                                {EventStatusLabels[event.status]}
                            </span>
                        </div>

                        {/* Event Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Event Type</h3>
                                    <p className="text-gray-900">
                                        {EventTypeLabels[event.eventType] || `Unknown (${event.eventType})`}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Activity Type</h3>
                                    <p className="text-gray-900">
                                        {ActivityTypeLabels[event.activityType as ActivityType] || `Unknown Activity (${event.activityType})`}
                                    </p>
                                </div>

                                {event.team && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Team</h3>
                                        <p className="text-gray-900">{event.team.teamName}</p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date & Time
                                    </h3>
                                    <p className="text-gray-900">{formatDate(event.eventDate)}</p>
                                    <p className="text-gray-600 text-sm">
                                        {formatTime(event.startTime)}
                                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Venue
                                    </h3>
                                    <p className="text-gray-900">{event.venue}</p>
                                    {event.venueAddress && (
                                        <p className="text-gray-600 text-sm">{event.venueAddress}</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                {event.opponentSchool && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Opponent School</h3>
                                        <p className="text-gray-900">{event.opponentSchool}</p>
                                    </div>
                                )}

                                {event.organizer && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Organizer</h3>
                                        <p className="text-gray-900">{event.organizer}</p>
                                    </div>
                                )}

                                {event.leadingTeacher && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Leading Teacher
                                        </h3>
                                        <p className="text-gray-900">{event.leadingTeacher.fullName}</p>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <a href={`mailto:${event.leadingTeacher.email}`} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {event.leadingTeacher.email}
                                            </a>
                                            <a href={`tel:${event.leadingTeacher.phoneNumber}`} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {event.leadingTeacher.phoneNumber}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {event.requiresParentConsent && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Parent Consent</h3>
                                        <p className="text-gray-900">Required</p>
                                        {event.parentNotificationSent && (
                                            <p className="text-green-600 text-sm mt-1">
                                                ✓ Notifications sent on {new Date(event.notificationSentDate!).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Information */}
                        {(event.description || event.specialInstructions || event.transportationDetails || event.uniformRequirements) && (
                            <div className="border-t border-gray-200 pt-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                                <div className="space-y-4">
                                    {event.description && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                                        </div>
                                    )}

                                    {event.specialInstructions && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Special Instructions</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap">{event.specialInstructions}</p>
                                        </div>
                                    )}

                                    {event.transportationDetails && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Transportation</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap">{event.transportationDetails}</p>
                                        </div>
                                    )}

                                    {event.uniformRequirements && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Uniform Requirements</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap">{event.uniformRequirements}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Results (if completed) */}
                        {(event.result || event.awardsReceived) && (
                            <div className="border-t border-gray-200 pt-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-500" />
                                    Results
                                </h3>
                                <div className="space-y-4">
                                    {event.result && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Result</h4>
                                            <p className="text-gray-900 font-medium">{event.result}</p>
                                        </div>
                                    )}

                                    {event.awardsReceived && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Awards Received</h4>
                                            <p className="text-gray-900">{event.awardsReceived}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Participants Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Participants ({event.totalParticipants})
                                </h3>
                                <div className="flex gap-4 text-sm">
                                    <span className="text-green-600">
                                        <CheckCircle className="w-4 h-4 inline mr-1" />
                                        Attended: {event.attendedParticipants}
                                    </span>
                                    <span className="text-blue-600">
                                        <CheckCircle className="w-4 h-4 inline mr-1" />
                                        Confirmed: {event.confirmedParticipants}
                                    </span>
                                </div>
                            </div>

                            {event.participants && event.participants.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {event.participants.map((participant) => (
                                                <tr key={participant.participantID} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{participant.studentName}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {participant.studentCode} • {participant.grade} {participant.class}
                                                            </div>
                                                            {participant.isFromTeam && (
                                                                <div className="text-xs text-blue-600 mt-1">
                                                                    Team: {participant.teamName}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <div className="text-sm text-gray-900">{participant.role}</div>
                                                            {participant.position && (
                                                                <div className="text-xs text-gray-500">{participant.position}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            {participant.attendanceConfirmed ? (
                                                                <span className="text-xs text-blue-600">✓ Confirmed</span>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">○ Pending</span>
                                                            )}
                                                            {participant.parentConsentReceived ? (
                                                                <span className="text-xs text-green-600">✓ Consent</span>
                                                            ) : event.requiresParentConsent ? (
                                                                <span className="text-xs text-orange-500">○ No Consent</span>
                                                            ) : null}
                                                            {participant.attended && (
                                                                <span className="text-xs text-green-600 font-medium">✓ Attended</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {participant.performance ? (
                                                            <p className="text-sm text-gray-700">{participant.performance}</p>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleRemoveParticipant(participant.participantID)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Remove"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                    <p>No participants added yet</p>
                                    <button
                                        onClick={() => setIsManageParticipantsOpen(true)}
                                        className="mt-4 text-blue-600 hover:text-blue-800"
                                    >
                                        Add Participants
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Manage Participants Modal */}
            {isManageParticipantsOpen && (
                <ManageParticipantsModal
                    event={event}
                    onClose={() => setIsManageParticipantsOpen(false)}
                    onSuccess={() => {
                        setIsManageParticipantsOpen(false);
                        loadEventDetails();
                    }}
                />
            )}
        </>
    );
};

export default EventDetailsModal;