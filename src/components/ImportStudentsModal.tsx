'use client';

import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { store } from '@/lib/store';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportPreview {
  code: string;
  nom: string;
  prenom: string;
  classe: string;
  type: string;
  isValid: boolean;
  error?: string;
}

export default function ImportStudentsModal({
  isOpen,
  onClose,
}: ImportStudentsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview[]>([]);
  const [error, setError] = useState<string>('');
  const [importing, setImporting] = useState(false);

  const validateRow = (row: string[]): ImportPreview => {
    const [code, nom, prenom, classe, type] = row.map(s => s.trim());
    
    let isValid = true;
    let error = '';

    if (!code || !nom || !prenom || !classe) {
      isValid = false;
      error = 'Tous les champs sont obligatoires';
    } else if (store.getStudent(code)) {
      isValid = false;
      error = 'Un élève avec ce code existe déjà';
    }

    return {
      code: code || '',
      nom: nom || '',
      prenom: prenom || '',
      classe: classe || '',
      type: type || '',
      isValid,
      error
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');
    setPreview([]);
    
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Le fichier doit être au format CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const lines = csvText.split('\n');
        
        if (lines.length < 2) {
          setError("Le fichier est vide ou ne contient que l'en-tête");
          return;
        }

        // Analyser et valider les données
        const previewData = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const columns = line.split(';');
            return validateRow(columns);
          });

        setPreview(previewData);
      } catch (err) {
        setError('Erreur lors de la lecture du fichier');
        console.error(err);
      }
    };
    
    reader.readAsText(file);
  };

  const handleImport = () => {
    setImporting(true);
    const validStudents = preview.filter(p => p.isValid);
    
    try {
      validStudents.forEach(student => {
        store.addStudent({
          id: student.code,
          matricule: student.code,
          lastName: student.nom,
          firstName: student.prenom,
          class: student.classe,
          cycle: student.type as 'LEP' | 'LG'
        });
      });

      onClose();
    } catch (err) {
      setError('Erreur lors de l\'importation');
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setPreview([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Importer des élèves
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Le fichier CSV doit contenir les colonnes dans cet ordre :
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <code className="text-sm">Code; Nom; Prénom; Classe; Type</code>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Format attendu :
                      <br />
                      <code className="bg-gray-50 px-2 py-1 rounded block mt-1">
                        1245;BEN CHOUCH;YOUSSEF;2CIEL;LEP
                        <br />
                        1246;BILUMBU;KATUVWA;1A;LEG
                      </code>
                    </p>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="file-upload"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Choisir un fichier
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {preview.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Aperçu de l'importation</h4>
                      <div className="max-h-64 overflow-y-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {preview.map((row, index) => (
                              <tr key={index} className={row.isValid ? '' : 'bg-red-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{row.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{row.nom}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{row.prenom}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{row.classe}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{row.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {row.isValid ? (
                                    <span className="text-green-600">Valide</span>
                                  ) : (
                                    <span className="text-red-600">{row.error}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {preview.filter(p => p.isValid).length} élèves valides sur {preview.length} au total
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                    onClick={handleClose}
                  >
                    Annuler
                  </button>
                  {preview.length > 0 && preview.some(p => p.isValid) && (
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                      onClick={handleImport}
                      disabled={importing}
                    >
                      {importing ? 'Importation...' : 'Importer les élèves valides'}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 