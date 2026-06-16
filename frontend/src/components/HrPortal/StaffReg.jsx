import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Briefcase, DollarSign, FileText, Upload,
  CheckCircle, XCircle
} from 'lucide-react';

const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    personalEmail: '',
    personalPhone: '',
    
    // Emergency Contact
    emergencyContact: '',
    emergencyContactName: '',
    emergencyRelation: '',
    
    // Address
    permanentAddress: '',
    temporaryAddress: '',
    city: '',
    country: 'Kenya',
    
    // Identification
    nationalId: '',
    kraPin: '',
    nssfNo: '',
    nhifNo: '',
    
    // Employment Details
    employmentType: '',
    employmentDate: '',
    department: '',
    designation: '',
    
    // Education
    highestQualification: '',
    specialization: '',
    university: '',
    yearOfGraduation: '',
    
    // Bank Details
    bankName: '',
    bankBranch: '',
    accountName: '',
    accountNumber: '',
    
    // Salary
    basicSalary: '',
    salaryCurrency: 'KES',
    paymentMode: '',
    
    // Documents
    photo: null,
    documents: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [approvedByAdmin, setApprovedByAdmin] = useState(true);

  const steps = [
    { id: 1, title: 'Personal Info' },
    { id: 2, title: 'Employment Details' },
    { id: 3, title: 'Bank & Salary' },
    { id: 4, title: 'Documents' },
    { id: 5, title: 'Review' }
  ];

  const handleSubmit = () => {
    if (!approvedByAdmin) {
      alert('This staff registration requires admin approval first.');
      return;
    }
    alert('Staff registration submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Staff Registration</h1>
          <p className="text-gray-600 mt-2">Register new staff after admin approval</p>
        </div>

        {/* Admin Approval Banner */}
        {!approvedByAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="font-medium text-red-800">Admin Approval Required</p>
                <p className="text-red-600 text-sm">This staff position requires admin approval before registration can proceed.</p>
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step.id}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Step {step.id}</p>
                <p className="font-medium text-gray-800">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-16 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              {/* More fields... */}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Employment Details</h3>
              {/* Employment fields... */}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex gap-3">
              <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Save Draft
              </button>
              <button
                onClick={() => currentStep < steps.length ? setCurrentStep(prev => prev + 1) : handleSubmit()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {currentStep === steps.length ? 'Submit Registration' : 'Next Step'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffRegistration;