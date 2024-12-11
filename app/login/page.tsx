"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, User } from 'lucide-react';
import { login, signup } from './actions';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [captcha, setCaptcha] = useState({
    num1: 0,
    num2: 0,
    operator: '+',
    answer: ''
  });

  const generateCaptcha = () => {
    const operators = ['+', '-']; // Removed multiplication
    const num1 = Math.floor(Math.random() * 1001);
    const num2 = Math.floor(Math.random() * 1001);
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    setCaptcha(prev => ({
      ...prev,
      num1,
      num2,
      operator,
      answer: ''
    }));
  };

  useEffect(() => {
    if (!isLogin) {
      generateCaptcha();
    }
  }, [isLogin]);

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCaptcha(prev => ({
      ...prev,
      answer: value
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      username: '',
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!isLogin && !formData.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!isLogin) {
      let correctAnswer;
      switch (captcha.operator) {
        case '+':
          correctAnswer = captcha.num1 + captcha.num2;
          break;
        case '-':
          correctAnswer = captcha.num1 - captcha.num2;
          break;
        default:
          correctAnswer = 0;
      }

      if (!captcha.answer || parseInt(captcha.answer) !== correctAnswer) {
        isValid = false;
        alert('Please solve the arithmetic challenge correctly');
        generateCaptcha(); // Generate new challenge after failed attempt
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Welcome back! Please login to your account' 
              : 'Create an account to start bidding'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className="pl-10"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="captcha">Verify you're human</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">
                    {captcha.num1} {captcha.operator} {captcha.num2} = ?
                  </span>
                  <Input
                    id="captcha"
                    name="captcha"
                    type="number"
                    className="w-24"
                    value={captcha.answer}
                    onChange={handleCaptchaChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateCaptcha}
                    className="px-2"
                  >
                    ↻
                  </Button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                formAction={async (formData: FormData) => {
                  if (validateForm()) {
                    if (isLogin) {
                      await login(formData);
                    } else {
                      await signup(formData);
                    }
                  }
                }}
                className="w-full"
              >
                {isLogin ? 'Login' : 'Sign Up'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;