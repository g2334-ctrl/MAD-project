import React from 'react';
import { AppProvider, useApp } from './AppContext';

// Common screens
import WelcomeScreen from './screens/WelcomeScreen';
import RoleSelectScreen from './screens/RoleSelectScreen';
import Profile from './screens/Profile';

// Patient screens
import PatientLogin from './screens/patient/PatientLogin';
import PatientRegister from './screens/patient/PatientRegister';
import PatientDashboard from './screens/patient/PatientDashboard';
import EmergencyConfirm from './screens/patient/EmergencyConfirm';
import CallingDriver from './screens/patient/CallingDriver';
import PatientTracking from './screens/patient/PatientTracking';
import MedicalProfile from './screens/patient/MedicalProfile';
import EmergencyContactsAlert from './screens/patient/EmergencyContactsAlert';

// Driver screens
import DriverLogin from './screens/driver/DriverLogin';
import DriverRegister from './screens/driver/DriverRegister';
import DriverDashboard from './screens/driver/DriverDashboard';
import DriverNavigation from './screens/driver/DriverNavigation';
import InformHospital from './screens/driver/InformHospital';
import HandoverChecklist from './screens/driver/HandoverChecklist';

// Hospital screens
import HospitalLogin from './screens/hospital/HospitalLogin';
import HospitalRegister from './screens/hospital/HospitalRegister';
import HospitalDashboard from './screens/hospital/HospitalDashboard';
import HospitalNotification from './screens/hospital/HospitalNotification';
import HospitalTracking from './screens/hospital/HospitalTracking';
import BedAvailability from './screens/hospital/BedAvailability';
import DepartmentRouting from './screens/hospital/DepartmentRouting';

// Shared screens
import ChatScreen from './screens/shared/ChatScreen';
import AdminAnalytics from './screens/shared/AdminAnalytics';

function ScreenRenderer() {
  const { screen } = useApp();

  switch (screen) {
    // Welcome & Auth Select
    case 'welcome':
      return <WelcomeScreen />;
    case 'roleSelect':
      return <RoleSelectScreen />;
    case 'profile':
      return <Profile />;

    // Patient Screens
    case 'patientLogin':
      return <PatientLogin />;
    case 'patientRegister':
      return <PatientRegister />;
    case 'patientDashboard':
      return <PatientDashboard />;
    case 'emergencyConfirm':
      return <EmergencyConfirm />;
    case 'callingDriver':
      return <CallingDriver />;
    case 'patientTracking':
      return <PatientTracking />;
    case 'medicalProfile':
      return <MedicalProfile />;
    case 'emergencyContactsAlert':
      return <EmergencyContactsAlert />;

    // Driver Screens
    case 'driverLogin':
      return <DriverLogin />;
    case 'driverRegister':
      return <DriverRegister />;
    case 'driverDashboard':
      return <DriverDashboard />;
    case 'driverNavigation':
      return <DriverNavigation />;
    case 'informHospital':
      return <InformHospital />;
    case 'handoverChecklist':
      return <HandoverChecklist />;

    // Hospital Screens
    case 'hospitalLogin':
      return <HospitalLogin />;
    case 'hospitalRegister':
      return <HospitalRegister />;
    case 'hospitalDashboard':
      return <HospitalDashboard />;
    case 'hospitalNotification':
      return <HospitalNotification />;
    case 'hospitalTracking':
      return <HospitalTracking />;
    case 'bedAvailability':
      return <BedAvailability />;
    case 'departmentRouting':
      return <DepartmentRouting />;

    // Shared
    case 'chatScreen':
      return <ChatScreen />;
    case 'adminAnalytics':
      return <AdminAnalytics />;

    default:
      return <WelcomeScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="phone-frame">
        <ScreenRenderer />
      </div>
    </AppProvider>
  );
}
