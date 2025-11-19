import { useState, useEffect } from 'react';
import {
    X, Users, Mail, Phone, Calendar, MapPin, Award, UserPlus, Edit,
    Trash2, Shield, Star, Hash, User
} from 'lucide-react';
import { teamService, type TeamWithDetails, type TeamMemberDto, type UpdateTeamMemberRequest } from '../../services/teamService';
import api from '../../services/api';

interface TeamDetailsModalProps {
    teamId: number;
    onClose: () => void;
    onEdit: () => void;
}

interface Student {
    studentID: number;
    studentCode: string;
    fullName: string;
    grade: string;
    class: string;
}

const TeamDetailsModal = ({ teamId, onClose, onEdit }: TeamDetailsModalProps) => {
    const [team, setTeam] = useState<TeamWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [position, setPosition] = useState('');
    const [editingMember, setEditingMember] = useState<TeamMemberDto | null>(null);

    useEffect(() => {
        loadTeamDetails();
    }, [teamId]);

    const loadTeamDetails = async () => {
        try {
            setLoading(true);
            const data = await teamService.getTeamById(teamId);
            setTeam(data);
        } catch (error) {
            console.error('Error loading team details:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async () => {
        try {
            const response = await api.get('/student');
            setStudents(response.data.data || []);
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const handleAddMembers = async () => {
        if (selectedStudents.length === 0) {
            alert('Please select at least one student');
            return;
        }

        try {
            await teamService.addTeamMembers(teamId, {
                teamID: teamId,
                studentIDs: selectedStudents,
                position: position
            });
            setShowAddMember(false);
            setSelectedStudents([]);
            setPosition('');
            // FIXED: Reload team details to get updated member count
            await loadTeamDetails();
        } catch (error) {
            console.error('Error adding members:', error);
            alert('Failed to add members');
        }
    };

    const handleUpdateMember = async (memberId: number, updates: UpdateTeamMemberRequest) => {
        try {
            await teamService.updateTeamMember(memberId, updates);
            setEditingMember(null);
            // FIXED: Reload team details to get updated member info
            await loadTeamDetails();
        } catch (error) {
            console.error('Error updating member:', error);
            alert('Failed to update member');
        }
    };

    const handleRemoveMember = async (memberId: number, studentName: string) => {
        if (!confirm(`Are you sure you want to remove ${studentName} from the team?`)) {
            return;
        }

        try {
            await teamService.removeTeamMember(memberId);
            // FIXED: Reload team details to get updated member count
            await loadTeamDetails();
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-center mt-4 text-gray-600">Loading team details...</p>
                </div>
            </div>
        );
    }

    if (!team) {
        return null;
    }

    const availableStudents = students.filter(
        s => !team.members.some(m => m.studentID === s.studentID)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{team.teamName}</h2>
                                <p className="text-sm text-gray-500">
                                    {team.teamCode} • {team.activityTypeName} • {team.activityCategory}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEdit}
                                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Team
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Team Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">Members</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">
                                {team.currentMemberCount}/{team.maxMembers}
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">Established</span>
                            </div>
                            <p className="text-lg font-semibold text-green-900">
                                {new Date(team.establishedDate).toLocaleDateString()}
                            </p>
                        </div>

                        <div className={`${team.isActive ? 'bg-green-50' : 'bg-gray-50'} p-4 rounded-lg`}>
                            <div className={`flex items-center gap-2 ${team.isActive ? 'text-green-700' : 'text-gray-700'} mb-1`}>
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-medium">Status</span>
                            </div>
                            <p className={`text-lg font-semibold ${team.isActive ? 'text-green-900' : 'text-gray-900'}`}>
                                {team.isActive ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                    </div>

                    {/* Coaching Staff */}
                    {(team.coach || team.assistantCoach) && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                                Coaching Staff
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {team.coach && (
                                    <div className="bg-white p-3 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Main Coach</p>
                                        <p className="font-semibold text-gray-900">{team.coach.fullName}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {team.coach.email}
                                            </span>
                                            {team.coach.phoneNumber && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {team.coach.phoneNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {team.assistantCoach && (
                                    <div className="bg-white p-3 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Assistant Coach</p>
                                        <p className="font-semibold text-gray-900">{team.assistantCoach.fullName}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {team.assistantCoach.email}
                                            </span>
                                            {team.assistantCoach.phoneNumber && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {team.assistantCoach.phoneNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Team Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {team.ageGroup && (
                            <div>
                                <p className="text-sm text-gray-500">Age Group</p>
                                <p className="font-medium text-gray-900">{team.ageGroup}</p>
                            </div>
                        )}
                        {team.division && (
                            <div>
                                <p className="text-sm text-gray-500">Division</p>
                                <p className="font-medium text-gray-900">{team.division}</p>
                            </div>
                        )}
                        {team.trainingSchedule && (
                            <div>
                                <p className="text-sm text-gray-500">Training Schedule</p>
                                <p className="font-medium text-gray-900">{team.trainingSchedule}</p>
                            </div>
                        )}
                        {team.trainingVenue && (
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Training Venue
                                </p>
                                <p className="font-medium text-gray-900">{team.trainingVenue}</p>
                            </div>
                        )}
                    </div>

                    {team.description && (
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Description</p>
                            <p className="text-gray-900">{team.description}</p>
                        </div>
                    )}

                    {team.achievements && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-700 mb-2">
                                <Award className="w-4 h-4" />
                                <h3 className="text-sm font-semibold uppercase tracking-wide">Achievements</h3>
                            </div>
                            <p className="text-gray-900">{team.achievements}</p>
                        </div>
                    )}

                    {/* Team Members */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Team Members ({team.members.length})
                            </h3>
                            <button
                                onClick={() => {
                                    loadStudents();
                                    setShowAddMember(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Members
                            </button>
                        </div>

                        {showAddMember && (
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-blue-900">Add New Members</h4>
                                    <button
                                        onClick={() => {
                                            setShowAddMember(false);
                                            setSelectedStudents([]);
                                            setPosition('');
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Position (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="e.g., Forward, Defender, Goalkeeper"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Students
                                        </label>
                                        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-white">
                                            {availableStudents.map((student) => (
                                                <label
                                                    key={student.studentID}
                                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.includes(student.studentID)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedStudents([...selectedStudents, student.studentID]);
                                                            } else {
                                                                setSelectedStudents(selectedStudents.filter(id => id !== student.studentID));
                                                            }
                                                        }}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <span className="text-sm">
                                                        {student.fullName} ({student.studentCode}) - {student.grade} {student.class}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddMembers}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Add {selectedStudents.length} Member(s)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Members List */}
                        <div className="space-y-2">
                            {team.members.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>No members yet. Add students to the team.</p>
                                </div>
                            ) : (
                                team.members.map((member) => (
                                    <div
                                        key={member.teamMemberID}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg">
                                                <User className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-gray-900">{member.studentName}</p>
                                                    {member.isCaptain && (
                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                                                            <Star className="w-3 h-3 inline mr-1" />
                                                            Captain
                                                        </span>
                                                    )}
                                                    {member.isViceCaptain && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                            Vice Captain
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>{member.studentCode}</span>
                                                    <span>{member.grade} {member.class}</span>
                                                    {member.position && <span>• {member.position}</span>}
                                                    {member.jerseyNumber && (
                                                        <span className="flex items-center gap-1">
                                                            <Hash className="w-3 h-3" />
                                                            {member.jerseyNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingMember(member)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveMember(member.teamMemberID, member.studentName)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Member Modal */}
                {editingMember && (
                    <EditMemberModal
                        member={editingMember}
                        onClose={() => setEditingMember(null)}
                        onSave={(updates) => handleUpdateMember(editingMember.teamMemberID, updates)}
                    />
                )}
            </div>
        </div>
    );
};

// Edit Member Modal Component
const EditMemberModal = ({
    member,
    onClose,
    onSave
}: {
    member: TeamMemberDto;
    onClose: () => void;
    onSave: (updates: UpdateTeamMemberRequest) => void;
}) => {
    const [formData, setFormData] = useState<UpdateTeamMemberRequest>({
        position: member.position || '',
        jerseyNumber: member.jerseyNumber || '',
        isCaptain: member.isCaptain,
        isViceCaptain: member.isViceCaptain
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Edit Member Details</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            Editing: <strong>{member.studentName}</strong> ({member.studentCode})
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                            type="text"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="e.g., Forward, Midfielder"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jersey Number</label>
                        <input
                            type="text"
                            value={formData.jerseyNumber}
                            onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="e.g., 10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isCaptain}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    isCaptain: e.target.checked,
                                    isViceCaptain: e.target.checked ? false : formData.isViceCaptain
                                })}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium">Captain</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isViceCaptain}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    isViceCaptain: e.target.checked,
                                    isCaptain: e.target.checked ? false : formData.isCaptain
                                })}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium">Vice Captain</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamDetailsModal;