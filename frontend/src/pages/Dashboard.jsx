import React from 'react';
import { Link } from 'react-router-dom';
import { FiDatabase, FiCode, FiLink, FiArrowRight, FiShield } from 'react-icons/fi';
import { useSecurityMode } from '../contexts/SecurityModeContext';
import DemoCard from '../components/common/DemoCard';
import Alert from '../components/common/Alert';
import Badge from '../components/common/Badge';

const Dashboard = () => {
  const { mode, isSecure } = useSecurityMode();
  
  const colorMap = {
    blue: {
      bg: 'bg-blue-100',
      bgHover: 'group-hover:bg-blue-200',
      text: 'text-blue-600',
    },
    purple: {
      bg: 'bg-purple-100',
      bgHover: 'group-hover:bg-purple-200',
      text: 'text-purple-600',
    },
    orange: {
      bg: 'bg-orange-100',
      bgHover: 'group-hover:bg-orange-200',
      text: 'text-orange-600',
    },
  };
  
  const attackCategories = [
    {
      path: '/sql-injection',
      icon: FiDatabase,
      title: 'SQL Injection',
      description: 'Learn how attackers exploit database queries by injecting malicious SQL code.',
      color: 'blue',
    },
    {
      path: '/xss',
      icon: FiCode,
      title: 'Cross-Site Scripting (XSS)',
      description: 'Understand how malicious scripts are injected into web pages viewed by users.',
      color: 'purple',
    },
    {
      path: '/csrf',
      icon: FiLink,
      title: 'Cross-Site Request Forgery (CSRF)',
      description: 'Explore how attackers trick users into performing unwanted actions.',
      color: 'orange',
    },
  ];
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FiShield className="w-12 h-12 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">SecureScape</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          An educational platform demonstrating common web security vulnerabilities 
          and their secure mitigations.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="mode">
            {isSecure ? 'Secure Mode' : 'Insecure Mode'}
          </Badge>
        </div>
      </div>
      
      {/* Mode Explanation */}
      <Alert 
        type={isSecure ? 'success' : 'warning'}
        title={isSecure ? 'Secure Mode Active' : 'Insecure Mode Active'}
      >
        {isSecure 
          ? 'You are viewing secure implementations with proper mitigations. Toggle to insecure mode to see vulnerable code.'
          : 'You are viewing vulnerable implementations. Toggle to secure mode to see how these vulnerabilities are mitigated.'}
      </Alert>
      
      {/* Attack Categories */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Attack Demonstrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {attackCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.path}
                to={category.path}
                className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-500 focus-ring group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${colorMap[category.color].bg} ${colorMap[category.color].bgHover} transition-colors`}>
                    <Icon className={`w-6 h-6 ${colorMap[category.color].text}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm">
                      <span>Explore Demo</span>
                      <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Quick Start Guide */}
      <DemoCard title="Quick Start Guide" badge="Getting Started">
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>
            <strong>Select an attack type</strong> from the categories above or use the sidebar navigation.
          </li>
          <li>
            <strong>Toggle between modes</strong> using the button in the header (or press Alt+M) to compare 
            vulnerable vs secure implementations.
          </li>
          <li>
            <strong>Try the attacks</strong> using the interactive demos. Payloads are available in the 
            Attacker Panel (press Alt+A or click the bottom panel).
          </li>
          <li>
            <strong>Read the explanations</strong> in each demo to understand what's happening and why 
            the secure implementation prevents the attack.
          </li>
        </ol>
      </DemoCard>
      
      {/* Learning Objectives */}
      <DemoCard title="Learning Objectives" badge="Education">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Understand common web security vulnerabilities (SQL Injection, XSS, CSRF)</li>
          <li>Recognize vulnerable code patterns and attack vectors</li>
          <li>Learn industry-standard mitigation techniques</li>
          <li>Compare vulnerable vs secure implementations side-by-side</li>
          <li>Practice identifying and preventing security flaws</li>
        </ul>
      </DemoCard>
    </div>
  );
};

export default Dashboard;
