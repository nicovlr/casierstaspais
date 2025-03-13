import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a été fourni' },
        { status: 400 }
      )
    }

    // Lire le contenu du fichier
    const fileContent = await file.text()
    
    // Parser le CSV avec les en-têtes personnalisés
    const records = parse(fileContent, {
      columns: (header: string[]) => ['code', 'nom', 'prenom', 'classe', 'type'],
      skip_empty_lines: true,
      delimiter: ',',
      from_line: 1 // Commence à la première ligne car nous définissons les en-têtes manuellement
    })

    // Traiter chaque ligne du CSV
    const importedStudents = await Promise.all(
      records.map(async (record: any) => {
        try {
          // Nettoyer les données
          const nom = record.nom.trim()
          const prenom = record.prenom.trim()
          const classe = record.classe.trim()
          const code = parseInt(record.code)

          // Vérifier si les données essentielles sont présentes
          if (!nom || !prenom || !classe || isNaN(code)) {
            console.error(`Données invalides pour l'étudiant: ${JSON.stringify(record)}`)
            return null
          }

          return await prisma.etudiant.create({
            data: {
              nom,
              prenom,
              classe,
              code
            },
          })
        } catch (error) {
          console.error(`Erreur lors de l'importation de l'étudiant: ${record.nom} ${record.prenom}`, error)
          return null
        }
      })
    )

    const successfulImports = importedStudents.filter(student => student !== null)

    return NextResponse.json({
      message: `${successfulImports.length} étudiants importés avec succès`,
      importedStudents: successfulImports,
    })

  } catch (error) {
    console.error('Erreur lors de l\'importation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'importation du fichier CSV' },
      { status: 500 }
    )
  }
} 