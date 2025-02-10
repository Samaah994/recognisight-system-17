
import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Shield, Clock, Users } from "lucide-react";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(true);

  const features = [
    {
      icon: <Camera className="w-6 h-6 text-primary" />,
      title: "Facial Recognition",
      description: "Advanced AI-powered facial recognition for accurate attendance tracking",
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Secure & Private",
      description: "Enterprise-grade security ensuring your data stays protected",
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Real-time Tracking",
      description: "Instant attendance updates and monitoring capabilities",
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Multiple Users",
      description: "Support for large organizations with multiple departments",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container px-4 pt-32 pb-20 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <span className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
            Next Generation Attendance System
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Face Recognition Attendance
            <span className="block text-primary">Made Simple</span>
          </h1>
          <p className="text-lg text-gray-600">
            Streamline your attendance management with our cutting-edge facial recognition system.
            Accurate, efficient, and completely hands-free.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-3 text-sm font-medium text-white transition-all rounded-lg bg-primary hover:bg-primary/90">
              Get Started
            </button>
            <button className="px-8 py-3 text-sm font-medium transition-all border rounded-lg text-primary border-primary hover:bg-primary/10">
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-3xl font-bold"
            >
              Why Choose Our System?
            </motion.h2>
            <p className="text-lg text-gray-600">
              Experience the future of attendance management with our comprehensive solution
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 transition-all rounded-2xl hover:shadow-lg hover:-translate-y-1"
              >
                <div className="p-3 mb-4 rounded-lg w-fit bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-lg text-gray-600">
              Get started with our face recognition system in three simple steps
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Register Users",
                description: "Add users to the system with their facial data",
              },
              {
                step: "02",
                title: "Set Up Cameras",
                description: "Connect your cameras to our secure system",
              },
              {
                step: "03",
                title: "Track Attendance",
                description: "Automatically track and manage attendance records",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-white rounded-2xl glass-card"
              >
                <span className="text-4xl font-bold text-primary/20">
                  {item.step}
                </span>
                <h3 className="mt-4 mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
