import React from 'react';
import { User, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const RoleSelectionPage = () => {
  const Navigate=useNavigate();
  const handleRoleSelection = (role) => {
    console.log(`Redirecting to ${role} login page`);
    Navigate(`/role/login?role=${role}`);
  };

  const roles = [
    {
      id: 'employee',
      title: 'Employee',
      description: 'Access your personal dashboard and learning resources',
      icon: User,
      color: 'from-chart-1 to-chart-2',
      hoverColor: 'hover:shadow-chart-1/20'
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Manage your team and oversee department operations',
      icon: Users,
      color: 'from-chart-3 to-chart-4',
      hoverColor: 'hover:shadow-chart-3/20'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Full system access and administrative controls',
      icon: Shield,
      color: 'from-chart-4 to-chart-5',
      hoverColor: 'hover:shadow-chart-4/20'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome User
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Select your role to continue to the login page
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => handleRoleSelection(role.id)}
                className={`
                  group cursor-pointer bg-card border border-border rounded-xl p-6
                  transition-all duration-300 hover:scale-105 hover:shadow-xl
                  ${role.hoverColor} hover:border-primary/20
                `}
              >
                <div className="text-center">
                  {/* Icon with gradient background */}
                  <div className={`
                    inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
                    bg-gradient-to-br ${role.color} shadow-lg
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {role.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>
                  
                  {/* Arrow indicator */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center text-primary font-medium">
                      Continue
                      <svg 
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;