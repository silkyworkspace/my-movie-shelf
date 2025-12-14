import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DashboardClient } from "./DashboardClient"

async function getMovies(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      userMovies: {
        where: { isDeleted: false },
        include: {
          movie: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!user) {
    return { wantToWatch: [], watched: [] }
  }

  const wantToWatch = user.userMovies
    .filter((um) => um.status === "WANT_TO_WATCH")
    .map((um) => ({
      id: um.movie.id,
      title: um.movie.title,
      posterPath: um.movie.posterPath,
      releaseDate: um.movie.releaseDate,
      status: "WANT_TO_WATCH" as const,
    }))

  const watched = user.userMovies
    .filter((um) => um.status === "WATCHED")
    .map((um) => ({
      id: um.movie.id,
      title: um.movie.title,
      posterPath: um.movie.posterPath,
      releaseDate: um.movie.releaseDate,
      status: "WATCHED" as const,
    }))

  return { wantToWatch, watched }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/")
  }

  const { wantToWatch, watched } = await getMovies(session.user.email)

  return (
    <DashboardClient
      userName={session.user.name}
      wantToWatch={wantToWatch}
      watched={watched}
    />
  )
}