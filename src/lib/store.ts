export type LockerStatus = 'free' | 'assigned' | 'maintenance';

export interface Locker {
  id: number;
  building: string;
  status: LockerStatus;
  studentId?: string;
}

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  class: string;
  cycle: 'LEP' | 'LG';
}

export interface HistoryEntry {
  id: string;
  date: string;
  action: string;
  details: string;
}

class Store {
  private lockers: Map<number, Locker> = new Map();
  private students: Map<string, Student> = new Map();
  private history: HistoryEntry[] = [];
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.loadFromLocalStorage();
    }
  }

  private saveToLocalStorage() {
    if (!this.isClient) return;
    
    const data = {
      lockers: Array.from(this.lockers.entries()),
      students: Array.from(this.students.entries()),
      history: this.history
    };
    try {
      localStorage.setItem('casiers-data', JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    if (!this.isClient) return;
    
    try {
      const data = localStorage.getItem('casiers-data');
      if (data) {
        const parsed = JSON.parse(data);
        this.lockers = new Map(parsed.lockers);
        this.students = new Map(parsed.students);
        this.history = parsed.history || [];
      }
    } catch (error) {
      console.error('Erreur lors du chargement depuis localStorage:', error);
    }
  }

  private addToHistory(action: string, details: string) {
    const entry: HistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      action,
      details
    };
    this.history.unshift(entry);
    // Garder seulement les 100 dernières entrées
    if (this.history.length > 100) {
      this.history.pop();
    }
    this.saveToLocalStorage();
  }

  // Locker methods
  addLocker(locker: Locker) {
    this.lockers.set(locker.id, locker);
    this.addToHistory('Ajout casier', `Casier ${locker.id} ajouté dans ${locker.building}`);
    this.saveToLocalStorage();
  }

  getLocker(id: number): Locker | undefined {
    return this.lockers.get(id);
  }

  updateLockerStatus(id: number, status: LockerStatus, studentId?: string) {
    const locker = this.lockers.get(id);
    if (locker) {
      // Si le casier était attribué à un autre élève, on libère l'ancien casier
      if (locker.studentId && studentId && locker.studentId !== studentId) {
        const oldStudent = this.students.get(locker.studentId);
        if (oldStudent) {
          this.addToHistory('Désattribution casier', 
            `Casier ${id} désattribué de ${oldStudent.lastName} ${oldStudent.firstName}`);
        }
      }

      if (status === 'assigned' && studentId) {
        const student = this.students.get(studentId);
        if (student) {
          this.addToHistory('Attribution casier',
            `Casier ${id} attribué à ${student.lastName} ${student.firstName}`);
        }
      } else if (status === 'maintenance') {
        this.addToHistory('Maintenance casier',
          `Casier ${id} mis en maintenance`);
      }
      
      this.lockers.set(id, { ...locker, status, studentId });
      this.saveToLocalStorage();
    }
  }

  // Student methods
  addStudent(student: Student) {
    this.students.set(student.id, student);
    this.addToHistory('Ajout élève',
      `${student.lastName} ${student.firstName} (${student.class}) ajouté`);
    this.saveToLocalStorage();
  }

  removeStudent(id: string) {
    const student = this.students.get(id);
    if (student) {
      // Libérer le casier si l'élève en avait un
      const locker = this.getStudentLocker(id);
      if (locker) {
        this.updateLockerStatus(locker.id, 'free', undefined);
      }
      
      this.students.delete(id);
      this.addToHistory('Suppression élève',
        `${student.lastName} ${student.firstName} (${student.class}) supprimé`);
      this.saveToLocalStorage();
    }
  }

  getStudent(id: string): Student | undefined {
    return this.students.get(id);
  }

  getAllStudents(): Student[] {
    return Array.from(this.students.values());
  }

  getStudentsByCycle(cycle: 'LEP' | 'LG'): Student[] {
    return Array.from(this.students.values()).filter(
      student => student.cycle === cycle
    );
  }

  getStudentLocker(studentId: string): Locker | undefined {
    return Array.from(this.lockers.values()).find(
      locker => locker.studentId === studentId
    );
  }

  searchStudents(query: string): Student[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.students.values()).filter(
      student =>
        student.lastName.toLowerCase().includes(lowercaseQuery) ||
        student.firstName.toLowerCase().includes(lowercaseQuery) ||
        student.matricule.toLowerCase().includes(lowercaseQuery)
    );
  }

  getLockersByBuilding(building: string): Locker[] {
    return Array.from(this.lockers.values()).filter(
      locker => locker.building === building
    );
  }

  // History methods
  getHistory(): HistoryEntry[] {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    this.saveToLocalStorage();
  }

  // Export methods
  exportLockerAssignments(): string {
    const headers = ['Numéro', 'Bâtiment', 'Statut', 'Matricule Élève', 'Nom Élève', 'Prénom Élève', 'Classe'];
    const rows = Array.from(this.lockers.values())
      .sort((a, b) => a.id - b.id)
      .map(locker => {
        const student = locker.studentId ? this.students.get(locker.studentId) : undefined;
        return [
          locker.id.toString(),
          locker.building,
          locker.status,
          student?.matricule || '',
          student?.lastName || '',
          student?.firstName || '',
          student?.class || ''
        ];
      });

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  getStatsByBuilding(building: string) {
    const lockers = this.getLockersByBuilding(building);
    return {
      total: lockers.length,
      assigned: lockers.filter(l => l.status === 'assigned').length,
      maintenance: lockers.filter(l => l.status === 'maintenance').length,
      free: lockers.filter(l => l.status === 'free').length
    };
  }

  getAllStats() {
    const buildings = new Set(Array.from(this.lockers.values()).map(l => l.building));
    const stats: Record<string, ReturnType<typeof this.getStatsByBuilding>> = {};
    buildings.forEach(building => {
      stats[building] = this.getStatsByBuilding(building);
    });
    return stats;
  }

  // Méthodes de nettoyage
  clearAllData() {
    this.lockers.clear();
    this.students.clear();
    this.history = [];
    if (this.isClient) {
      localStorage.removeItem('casiers-data');
    }
  }
}

let store: Store;

// Créer le store uniquement côté client
if (typeof window !== 'undefined') {
  store = new Store();
} else {
  // Version serveur du store (vide)
  store = new Store();
}

export { store }; 