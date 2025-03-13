'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import LockerModal from '@/components/LockerModal';
import ImportStudentsModal from '@/components/ImportStudentsModal';
import StudentDetailsModal from '@/components/StudentDetailsModal';
import HistoryModal from '@/components/HistoryModal';
import Notification from '@/components/Notification';
import LockerDetailsModal from '@/components/LockerDetailsModal';
import { store, type Locker, type LockerStatus, type Student } from '@/lib/store';

const BUILDINGS = {
  'Bâtiment C': { start: 1, end: 50 },
  'Bâtiment D - Petit Couloir': { start: 1, end: 78 },
  'Bâtiment D - Préau Classes': { start: 79, end: 276 },
  'Bâtiment D - Préau WC Garçons': { start: 277, end: 348 },
  'Bâtiment D - Préau WC Filles': { start: 349, end: 420 },
  'Bâtiment D - Grand Couloir Gauche': { start: 421, end: 620 },
  'Bâtiment D - Grand Couloir Droite': { start: 621, end: 704 }
};

const STATUS_COLORS = {
  free: { bg: 'bg-green-100 hover:bg-green-200', text: 'Libre' },
  assigned: { bg: 'bg-blue-100 hover:bg-blue-200', text: 'Attribué' },
  maintenance: { bg: 'bg-red-100 hover:bg-red-200', text: 'Maintenance' }
};

export default function Dashboard() {
  const router = useRouter();
  const [selectedBuilding, setSelectedBuilding] = useState<string>('Bâtiment C');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  // Initialize lockers on client side only
  useEffect(() => {
    Object.entries(BUILDINGS).forEach(([building, { start, end }]) => {
      for (let i = start; i <= end; i++) {
        if (!store.getLocker(i)) {
          store.addLocker({
            id: i,
            building,
            status: 'free'
          });
        }
      }
    });
  }, []);

  const handleLogout = () => {
    router.push('/');
  };

  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLockerClick = (locker: Locker) => {
    setSelectedLocker(locker);
    setIsLockerModalOpen(true);
  };

  const handleModalSubmit = (data: { status: LockerStatus; studentId?: string }) => {
    if (selectedLocker) {
      store.updateLockerStatus(selectedLocker.id, data.status, data.studentId);
      setIsLockerModalOpen(false);
      setSelectedLocker(null);
      showNotification('success', 'Casier mis à jour avec succès');
      // Force re-render
      setSelectedBuilding(selectedBuilding);
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentDetailsOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Voulez-vous vraiment supprimer l'élève ${student.firstName} ${student.lastName} ?`)) {
      store.removeStudent(student.id);
      showNotification('success', 'Élève supprimé avec succès');
      setSearchQuery(''); // Rafraîchir la recherche
    }
  };

  const lockers = store.getLockersByBuilding(selectedBuilding);
  const buildingRange = BUILDINGS[selectedBuilding as keyof typeof BUILDINGS];
  const displayedLockers = [...Array(buildingRange.end - buildingRange.start + 1)].map((_, i) => {
    const lockerId = buildingRange.start + i;
    return store.getLocker(lockerId);
  });

  const filteredStudents = useMemo(() => {
    return searchQuery
      ? store.searchStudents(searchQuery)
      : store.getAllStudents();
  }, [searchQuery]);

  const getLockerColor = (status?: LockerStatus) => {
    return status ? STATUS_COLORS[status].bg : 'bg-gray-100 hover:bg-gray-200';
  };

  // Calculer les statistiques
  const stats = useMemo(() => {
    const total = displayedLockers.length;
    const assigned = displayedLockers.filter(l => l?.status === 'assigned').length;
    const maintenance = displayedLockers.filter(l => l?.status === 'maintenance').length;
    const free = displayedLockers.filter(l => l?.status === 'free').length;
    return { total, assigned, maintenance, free };
  }, [displayedLockers]);

  const handlePreviousBuilding = () => {
    const buildings = Object.keys(BUILDINGS);
    const currentIndex = buildings.indexOf(selectedBuilding);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : buildings.length - 1;
    setSelectedBuilding(buildings[previousIndex]);
  };

  const handleNextBuilding = () => {
    const buildings = Object.keys(BUILDINGS);
    const currentIndex = buildings.indexOf(selectedBuilding);
    const nextIndex = currentIndex < buildings.length - 1 ? currentIndex + 1 : 0;
    setSelectedBuilding(buildings[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-700">Gestion des Casiers</h1>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="search"
                placeholder="Rechercher un élève..."
                className="rounded-md border border-gray-300 px-3 py-2 text-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-16">
        {searchQuery && filteredStudents.length > 0 && (
          <div className="mb-6 px-4 sm:px-0">
            <h2 className="text-lg font-semibold mb-2">Résultats de la recherche</h2>
            <div className="bg-white shadow rounded-lg divide-y">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="p-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div 
                    className="flex-grow cursor-pointer"
                    onClick={() => handleStudentClick(student)}
                  >
                    <p className="font-medium">{student.lastName} {student.firstName}</p>
                    <p className="text-sm text-gray-500">
                      Classe: {student.class} | Matricule: {student.matricule}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudent(student);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4 items-center">
              <h2 className="text-2xl font-bold text-gray-800">{selectedBuilding}</h2>
            </div>

            {/* Statistiques */}
            <div className="flex space-x-4">
              <div className="px-4 py-2 bg-white rounded-md shadow">
                <span className="text-sm text-gray-500">Total:</span>
                <span className="ml-2 font-semibold text-gray-800">{stats.total}</span>
              </div>
              <div className="px-4 py-2 bg-blue-50 rounded-md shadow">
                <span className="text-sm text-blue-600">Attribués:</span>
                <span className="ml-2 font-semibold text-blue-600">{stats.assigned}</span>
              </div>
              <div className="px-4 py-2 bg-green-50 rounded-md shadow">
                <span className="text-sm text-green-600">Libres:</span>
                <span className="ml-2 font-semibold text-green-600">{stats.free}</span>
              </div>
              <div className="px-4 py-2 bg-red-50 rounded-md shadow">
                <span className="text-sm text-red-600">Maintenance:</span>
                <span className="ml-2 font-semibold text-red-600">{stats.maintenance}</span>
              </div>
            </div>
          </div>

          {/* Légende */}
          <div className="mb-4 flex space-x-4">
            {Object.entries(STATUS_COLORS).map(([status, { bg, text }]) => (
              <div key={status} className="flex items-center">
                <div className={`w-4 h-4 ${bg.split(' ')[0]} rounded mr-2`} />
                <span className="text-sm text-gray-600">{text}</span>
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-10 gap-4">
                {displayedLockers.map((locker, index) => {
                  const student = locker?.studentId ? store.getStudent(locker.studentId) : null;
                  return (
                    <div
                      key={index}
                      className={`aspect-square ${getLockerColor(locker?.status)} rounded-md flex flex-col items-center justify-center cursor-pointer p-1 text-gray-800`}
                      onClick={() => locker && handleLockerClick(locker)}
                    >
                      <span className="font-medium">{buildingRange.start + index}</span>
                      {student && (
                        <span className="text-xs text-center mt-1 line-clamp-2">
                          {student.lastName}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navigation Buttons */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={handlePreviousBuilding}
          className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
          title="Bâtiment précédent"
        >
          <ChevronLeftIcon className="h-8 w-8 text-gray-600" />
        </button>
      </div>

      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={handleNextBuilding}
          className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
          title="Bâtiment suivant"
        >
          <ChevronRightIcon className="h-8 w-8 text-gray-600" />
        </button>
      </div>

      {/* Action Menu */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end space-y-4">
        {isActionMenuOpen && (
          <div className="flex flex-col items-end space-y-2 mb-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2 shadow-lg"
            >
              <span>Historique</span>
            </button>
            <button
              onClick={() => {
                const csv = store.exportLockerAssignments();
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'casiers.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                showNotification('success', 'Export CSV téléchargé');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 shadow-lg"
            >
              <span>Exporter CSV</span>
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 shadow-lg"
            >
              <span>Importer des élèves</span>
            </button>
            <button
              onClick={() => {
                setSelectedLocker(null);
                setIsLockerModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 shadow-lg"
            >
              <span>Ajouter un casier</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
          className={`${
            isActionMenuOpen ? 'bg-gray-600' : 'bg-blue-600'
          } text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-colors`}
          title={isActionMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isActionMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <PlusIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {selectedLocker && (
        <LockerDetailsModal
          isOpen={isLockerModalOpen}
          onClose={() => {
            setIsLockerModalOpen(false);
            setSelectedLocker(null);
          }}
          locker={selectedLocker}
          onUpdate={handleModalSubmit}
        />
      )}

      <ImportStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {selectedStudent && (
        <StudentDetailsModal
          isOpen={isStudentDetailsOpen}
          onClose={() => {
            setIsStudentDetailsOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          locker={store.getStudentLocker(selectedStudent.id)}
        />
      )}

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          show={true}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
} 