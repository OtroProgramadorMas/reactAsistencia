// src/pages/AprendizPage.tsx
import React from 'react';
import Navbar from '../components/shared/navbar';
import FuncionarioCard from '../components/shared/modalInfoFuncionario';

const InstructorHomePage = () => {
  // datos del localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  return (
    <>
      <Navbar userType="aprendiz" userName={userData.nombre} />
      <FuncionarioCard/>
    </>
  );
};

export default InstructorHomePage;