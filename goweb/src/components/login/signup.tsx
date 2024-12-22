import React, { useState } from 'react';
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

interface SignUpFormProps {
  step: number;
  handleBack: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ step, handleBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  const validateUsername = (username: string) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== formData.password) return 'Passwords do not match';
    return '';
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    let error = '';
    switch (name) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'username':
        error = validateUsername(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Also validate confirm password when password changes
        if (formData.confirmPassword) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: formData.confirmPassword !== value ? 'Passwords do not match' : ''
          }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value);
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      email: validateEmail(formData.email),
      username: validateUsername(formData.username),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword)
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).every(error => error === '')) {
      // Submit the form - you can add your submission logic here
      console.log('Form submitted:', formData);
    }
  };

  return step === 3 ? (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Input
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="johndoe@example.com"
          startContent={<FaEnvelope />}
          size="lg"
          type="email"
          isInvalid={!!errors.email}
          errorMessage={errors.email}
        />
      </div>
      <div>
        <Input
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="create username"
          startContent={<FaUser />}
          size="lg"
          type="text"
          isInvalid={!!errors.username}
          errorMessage={errors.username}
        />
      </div>
      <div>
        <Input
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="create password"
          startContent={<FaLock />}
          size="lg"
          type="password"
          isInvalid={!!errors.password}
          errorMessage={errors.password}
        />
      </div>
      <div>
        <Input
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          placeholder="confirm password"
          startContent={<FaLock />}
          size="lg"
          type="password"
          isInvalid={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
        size="lg"
      >
        Sign Up
      </Button>
      <Button
        type="button"
        className="w-full bg-gray-600 text-white hover:bg-gray-700"
        size="lg"
        onClick={handleBack}
      >
        Back
      </Button>
    </form>
  ) : null;
};

export default SignUpForm;