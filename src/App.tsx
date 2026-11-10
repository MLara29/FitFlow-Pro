import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { dismissSyncError, useCurrent } from './lib/store'
import Home from './screens/Home'
import Login, { NewPassword } from './screens/Login'
import Onboarding, { PlanReady } from './screens/Onboarding'
import Profile from './screens/Profile'
import Progress from './screens/Progress'
import Workout from './screens/Workout'
import Workouts, { ExerciseDetail, Library } from './screens/Workouts'

export default function App() {
  const { user, profile, plan, ready, syncError, recovery } = useCurrent()
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  let routes
  if (!user) routes = <Route path="*" element={<Login />} />
  else if (recovery) routes = <Route path="*" element={<NewPassword />} />
  else if (!profile || !plan) routes = <Route path="*" element={<Onboarding />} />
  else {
    routes = (
      <>
        <Route path="/" element={<Home />} />
        <Route path="/plano-pronto" element={<PlanReady />} />
        <Route path="/treinos" element={<Workouts />} />
        <Route path="/treino/:dayId" element={<Workout />} />
        <Route path="/exercicios" element={<Library />} />
        <Route path="/exercicio/:id" element={<ExerciseDetail />} />
        <Route path="/progresso" element={<Progress />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </>
    )
  }
  if (!ready) {
    return (
      <div className="app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span className="display accent" style={{ fontSize: 22 }} role="status">FitFlow Pro</span>
      </div>
    )
  }
  return (
    <div className="app">
      {syncError && (
        <button type="button" className="sync-error" role="alert" onClick={dismissSyncError}>
          {syncError} Toque para fechar.
        </button>
      )}
      <Routes>{routes}</Routes>
    </div>
  )
}
