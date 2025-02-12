
import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Users, Upload, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      icon: <Camera className="w-6 h-6 text-primary" />,
      title: "Face Recognition",
      description: "Advanced AI-powered face detection and recognition",
      route: "/recognition"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "User Management",
      description: "Register and manage users efficiently",
      route: "/users"
    },
    {
      icon: <Upload className="w-6 h-6 text-primary" />,
      title: "Bulk Upload",
      description: "Import multiple users via Excel upload",
      route: "/bulk-upload"
    },
    {
      icon: <Activity className="w-6 h-6 text-primary" />,
      title: "Attendance Logs",
      description: "View and export attendance records",
      route: "/logs"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container px-4 mx-auto">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-20 text-center"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
            Next Generation Face Recognition
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Smart Attendance System
            <span className="block mt-2 text-primary">Made Simple</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your attendance management with our cutting-edge facial recognition system.
            Accurate, efficient, and completely hands-free.
          </p>
        </motion.section>

        {/* Features Grid */}
        <section className="pb-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setIsHovered(feature.title)}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => navigate(feature.route)}
                className="relative p-6 glass-card rounded-2xl cursor-pointer group hover-scale"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-gray-600">{feature.description}</p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isHovered === feature.title ? 1 : 0,
                      scale: isHovered === feature.title ? 1 : 0.8
                    }}
                    className="absolute inset-0 bg-primary/5 rounded-2xl"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
