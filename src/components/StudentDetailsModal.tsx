'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Student, Locker } from '@/lib/store';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  locker?: Locker;
}

export default function StudentDetailsModal({
  isOpen,
  onClose,
  student,
  locker,
}: StudentDetailsModalProps) {
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Détails de l'élève
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Informations personnelles</h4>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Nom:</span> {student.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Prénom:</span> {student.firstName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Matricule:</span> {student.matricule}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Classe:</span> {student.class}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Cycle:</span> {student.cycle}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Casier</h4>
                    <div className="mt-2">
                      {locker ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Numéro:</span> {locker.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Bâtiment:</span> {locker.building}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Statut:</span>{' '}
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              locker.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                              locker.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {locker.status === 'assigned' ? 'Attribué' :
                               locker.status === 'maintenance' ? 'Maintenance' : 'Libre'}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Aucun casier attribué
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                    onClick={onClose}
                  >
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 