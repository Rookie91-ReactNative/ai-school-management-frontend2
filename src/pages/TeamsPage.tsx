import { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, Eye, Edit, Calendar,
    MapPin, User, /*Hash,*/ Trophy, Star
} from 'lucide-react';
import { teamService, ActivityType, ActivityTypeLabels, ActivityCategories, type TeamWithDetails } from '../services/teamService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Pagination from '../components/Common/Pagination';
import AddTeamModal from '../components/Teams/AddTeamModal';
import EditTeamModal from '../components/Teams/EditTeamModal';
import TeamDetailsModal from '../components/Teams/TeamDetailsModal';

const TeamsPage = () => {
    const [teams, setTeams] = useState<TeamWithDetails[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<TeamWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | 'All'>('All');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<TeamWithDetails | null>(null);
    const [viewTeamId, setViewTeamId] = useState<number | null>(null);
    const [loadingTeamDetails, setLoadingTeamDetails] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        loadTeams();
    }, [showActiveOnly]);

    useEffect(() => {
        filterTeams();
    }, [teams, searchTerm, selectedCategory, selectedActivityType]);

    const loadTeams = async () => {
        try {
            setLoading(true);
            const data = await teamService.getAllTeams(showActiveOnly);
            setTeams(data);
        } catch (error) {
            console.error('Error loading teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTeams = () => {
        let filtered = [...teams];

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(team =>
                team.teamName.toLowerCase().includes(searchLower) ||
                team.teamCode.toLowerCase().includes(searchLower) ||
                team.activityTypeName.toLowerCase().includes(searchLower) ||
                team.coach?.fullName.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(team => team.activityCategory === selectedCategory);
        }

        // Activity Type filter
        if (selectedActivityType !== 'All') {
            filtered = filtered.filter(team => team.activityType === selectedActivityType);
        }

        setFilteredTeams(filtered);
        setCurrentPage(1);
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTeams = filteredTeams.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);

    const handleViewTeam = (teamId: number) => {
        setViewTeamId(teamId);
    };

    // ✅ FIXED: Fetch full team details before opening edit modal
    const handleEditTeam = async (team: TeamWithDetails) => {
        try {
            setLoadingTeamDetails(true);

            // Fetch full team details with all fields
            const fullTeamDetails = await teamService.getTeamById(team.teamID);

            console.log('Full team details for editing:', fullTeamDetails);

            setSelectedTeam(fullTeamDetails);
            setIsEditModalOpen(true);
        } catch (error) {
            console.error('Error loading team details:', error);
            alert('Failed to load team details');
        } finally {
            setLoadingTeamDetails(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-600" />
                            Teams & Activities
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage school teams, clubs, and extracurricular activities
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Team
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search teams, codes, or coaches..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="All">All Categories</option>
                                {Object.keys(ActivityCategories).map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Activity Type Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={selectedActivityType}
                                onChange={(e) => setSelectedActivityType(e.target.value === 'All' ? 'All' : parseInt(e.target.value) as ActivityType)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="All">All Activities</option>
                                {Object.entries(ActivityType)
                                    .filter(([key]) => isNaN(Number(key)))
                                    .map(([key, value]) => (
                                        <option key={key} value={value}>
                                            {ActivityTypeLabels[value as ActivityType]}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filter Toggle */}
                    <div className="mt-4 flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showActiveOnly}
                                onChange={(e) => setShowActiveOnly(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Show active teams only</span>
                        </label>
                        <span className="text-sm text-gray-500 ml-auto">
                            {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} found
                        </span>
                    </div>
                </div>
            </div>

            {/* Teams Grid */}
            {filteredTeams.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || selectedCategory !== 'All' || selectedActivityType !== 'All'
                            ? 'Try adjusting your filters'
                            : 'Get started by creating your first team'}
                    </p>
                    {!searchTerm && selectedCategory === 'All' && selectedActivityType === 'All' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-5 h-5" />
                            Create Team
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentTeams.map((team) => (
                            <div
                                key={team.teamID}
                                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                            >
                                {/* Card Header */}
                                <div className="p-4 border-b">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {team.teamName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{team.teamCode}</p>
                                        </div>
                                        {team.isActive ? (
                                            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                            {team.activityCategory}
                                        </span>
                                        <span className="text-xs text-gray-600">
                                            {team.activityTypeName}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-3">
                                    {/* Coach */}
                                    {team.coach && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">Coach:</span>
                                            <span className="font-medium text-gray-900">
                                                {team.coach.fullName}
                                            </span>
                                        </div>
                                    )}

                                    {/* Members */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">
                                            {team.currentMemberCount} / {team.maxMembers} members
                                        </span>
                                    </div>

                                    {/* Training Schedule */}
                                    {team.trainingSchedule && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 truncate">
                                                {team.trainingSchedule}
                                            </span>
                                        </div>
                                    )}

                                    {/* Training Venue */}
                                    {team.trainingVenue && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 truncate">
                                                {team.trainingVenue}
                                            </span>
                                        </div>
                                    )}

                                    {/* Achievements */}
                                    {team.achievements && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <Trophy className="w-4 h-4 text-yellow-500 mt-0.5" />
                                            <span className="text-gray-600 text-xs line-clamp-2">
                                                {team.achievements}
                                            </span>
                                        </div>
                                    )}

                                    {/* Division/Age Group */}
                                    {(team.division || team.ageGroup) && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Star className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">
                                                {[team.division, team.ageGroup].filter(Boolean).join(' • ')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Actions */}
                                <div className="p-4 border-t bg-gray-50 flex gap-2">
                                    <button
                                        onClick={() => handleViewTeam(team.teamID)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleEditTeam(team)}
                                        disabled={loadingTeamDetails}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Edit className="w-4 h-4" />
                                        {loadingTeamDetails ? 'Loading...' : 'Edit'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                    totalItems={filteredTeams.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            {isAddModalOpen && (
                <AddTeamModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        loadTeams();
                    }}
                />
            )}

            {isEditModalOpen && selectedTeam && (
                <EditTeamModal
                    team={selectedTeam}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedTeam(null);
                    }}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        setSelectedTeam(null);
                        loadTeams();
                    }}
                />
            )}

            {viewTeamId && (
                <TeamDetailsModal
                    teamId={viewTeamId}
                    onClose={() => setViewTeamId(null)}
                    onEdit={() => {
                        const team = teams.find(t => t.teamID === viewTeamId);
                        if (team) {
                            setViewTeamId(null);
                            handleEditTeam(team);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default TeamsPage;