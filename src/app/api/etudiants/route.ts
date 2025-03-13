import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const etudiants = await prisma.etudiant.findMany({
      include: {
        casiers: true, // Inclut les casiers associés à chaque étudiant
      },
    })
    return NextResponse.json(etudiants)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des étudiants' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nom, prenom, classe, code } = body

    const nouvelEtudiant = await prisma.etudiant.create({
      data: {
        nom,
        prenom,
        classe,
        code,
      },
    })

    return NextResponse.json(nouvelEtudiant, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'étudiant' },
      { status: 500 }
    )
  }
} 