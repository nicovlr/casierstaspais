'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Student, LockerStatus } from '@/lib/store';

interface LockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSubmit: (data: {
    status: LockerStatus;
    studentId?: string;
  }) => void;
}

export default function LockerModal({
  isOpen,
  onClose,
  students,
  onSubmit,
}: LockerModalProps) {
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
                  Gérer le casier
                </Dialog.Title>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const status = formData.get('status') as LockerStatus;
                    const studentId = formData.get('studentId') as string;
                    onSubmit({ status, studentId: studentId || undefined });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Statut
                    </label>
                    <select
                      name="status"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    >
                      <option value="free">Libre</option>
                      <option value="assigned">Attribué</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Élève
                    </label>
                    <select
                      name="studentId"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="">Sélectionner un élève</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.lastName} {student.firstName} ({student.class})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                      onClick={onClose}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 