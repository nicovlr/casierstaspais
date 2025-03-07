'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Student, Locker, LockerStatus, store } from '@/lib/store';
import { PencilIcon, UserIcon, KeyIcon, WrenchIcon } from '@heroicons/react/24/outline';

interface LockerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locker: Locker;
  onUpdate: (data: {
    status: LockerStatus;
    studentId?: string;
  }) => void;
}

const STATUS_ICONS = {
  free: <KeyIcon className="w-6 h-6 text-green-500" />,
  assigned: <UserIcon className="w-6 h-6 text-blue-500" />,
  maintenance: <WrenchIcon className="w-6 h-6 text-red-500" />
};

const STATUS_COLORS = {
  free: 'bg-green-50 text-green-700 ring-green-600/20',
  assigned: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  maintenance: 'bg-red-50 text-red-700 ring-red-600/20'
};

const STATUS_TEXT = {
  free: 'Libre',
  assigned: 'Attribué',
  maintenance: 'Maintenance'
};

export default function LockerDetailsModal({
  isOpen,
  onClose,
  locker,
  onUpdate,
}: LockerDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const student = locker.studentId ? store.getStudent(locker.studentId) : null;
  const allStudents = store.getAllStudents();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const status = formData.get('status') as LockerStatus;
    const studentId = formData.get('studentId') as string;
    onUpdate({ status, studentId: studentId || undefined });
    setIsEditing(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {!isEditing ? (
                  <div className="space-y-6">
                    {/* En-tête */}
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Dialog.Title className="text-2xl font-bold text-gray-900">
                            Casier {locker.id}
                          </Dialog.Title>
                          <p className="text-sm text-gray-500 mt-1">{locker.building}</p>
                        </div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Statut */}
                    <div>
                      <div className="flex items-center space-x-2">
                        {STATUS_ICONS[locker.status]}
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${STATUS_COLORS[locker.status]}`}>
                          {STATUS_TEXT[locker.status]}
                        </span>
                      </div>
                    </div>

                    {/* Informations de l'élève */}
                    {student && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-900 flex items-center space-x-2 mb-3">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                          <span>Élève assigné</span>
                        </h4>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-gray-900">
                            {student.lastName} {student.firstName}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Classe:</span>
                              <p>{student.class}</p>
                            </div>
                            <div>
                              <span className="font-medium">Matricule:</span>
                              <p>{student.matricule}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bouton de fermeture */}
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                        onClick={onClose}
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-b pb-4">
                      <Dialog.Title className="text-2xl font-bold text-gray-900">
                        Modifier le casier {locker.id}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">{locker.building}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Statut
                        </label>
                        <select
                          name="status"
                          defaultValue={locker.status}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="free">Libre</option>
                          <option value="assigned">Attribué</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Élève
                        </label>
                        <select
                          name="studentId"
                          defaultValue={student?.id || ''}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner un élève</option>
                          {allStudents.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.lastName} {student.firstName} ({student.class})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                        onClick={() => setIsEditing(false)}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 