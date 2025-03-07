'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { store, type HistoryEntry } from '@/lib/store';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const actionColors = {
  'Ajout casier': 'bg-green-50 text-green-700',
  'Attribution casier': 'bg-blue-50 text-blue-700',
  'Désattribution casier': 'bg-yellow-50 text-yellow-700',
  'Maintenance casier': 'bg-red-50 text-red-700',
  'Ajout élève': 'bg-purple-50 text-purple-700',
  'Suppression élève': 'bg-pink-50 text-pink-700',
};

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const history = store.getHistory();

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center"
                >
                  <ClockIcon className="h-6 w-6 mr-2" />
                  Historique des actions
                </Dialog.Title>

                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      {history.map((entry, entryIdx) => (
                        <li key={entry.id}>
                          <div className="relative pb-8">
                            {entryIdx !== history.length - 1 ? (
                              <span
                                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span
                                  className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    actionColors[entry.action as keyof typeof actionColors] || 'bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <ClockIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">
                                      {entry.action}
                                    </span>{' '}
                                    {entry.details}
                                  </p>
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  {formatDate(entry.date)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md"
                    onClick={() => {
                      if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
                        store.clearHistory();
                        onClose();
                      }
                    }}
                  >
                    Effacer l'historique
                  </button>
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