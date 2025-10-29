import React, { Suspense, lazy, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import HotelSearchForm from "./components/HotelSearchForm";
import DestinationCard from "./components/DestinationCard";
import OfferCard from "./components/OfferCard";
import TestimonialCard from "./components/TestimonialCard";
import { Helmet } from "react-helmet";
import Header from "./components/Header";
import Slider from "./components/Slider";
import Row01 from "./components/Row01";
import Accommodation from "./components/Accomodation";
import Services from "./components/Services";
import Footer from "./components/Footer";

const TestimonialsCarousel = ({ testimonials, isMobile }) => {
  const [isPaused, setIsPaused] = useState(false);
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <motion.section
      className="py-12 md:py-16 bg-gray-50 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-center mb-8 underline"
          variants={isMobile ? fadeInUpMobile : fadeInUp}
        >
          What Our Customers Say
        </motion.h2>

        <div className="relative">
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 20s linear infinite;
            }
            .animate-scroll.paused {
              animation-play-state: paused;
            }
          `}</style>
          
          <div 
            className={`flex ${isPaused ? 'animate-scroll paused' : 'animate-scroll'}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div key={`${testimonial.id}-${index}`} className="w-80 flex-shrink-0 px-3">
                <TestimonialCard
                  name={testimonial.name}
                  image={testimonial.image}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInUpMobile = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const staggerContainerMobile = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const scaleInMobile = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const featuredDestinations = [
    {
      id: 1,
      name: "Paris, France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
      description:
        "Experience the city of love with its iconic landmarks and cuisine.",
    },
    {
      id: 2,
      name: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop",
      description:
        "Relax on pristine beaches and explore lush tropical landscapes.",
    },
    {
      id: 3,
      name: "New York, USA",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop",
      description:
        "Discover the city that never sleeps with its vibrant culture.",
    },
  ];

  const specialOffers = [
    {
      id: 1,
      title: "Summer Getaway",
      discount: "25% OFF",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop",
      description:
        "Book your summer vacation now and get 25% off on selected hotels.",
    },
    {
      id: 2,
      title: "Weekend Escape",
      discount: "Free Breakfast",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop",
      description:
        "Enjoy complimentary breakfast when you book a weekend stay.",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      image: "https://ui-avatars.com/api/?name=Sarah+Johnson&size=100&background=3b82f6&color=fff",
      rating: 5,
      text: "The booking process was so easy and we found an amazing hotel at a great price!",
    },
    {
      id: 2,
      name: "Michael Brown",
      image: "https://ui-avatars.com/api/?name=Michael+Brown&size=100&background=10b981&color=fff",
      rating: 4,
      text: "Great selection of hotels and the customer service was excellent.",
    },
    {
      id: 3,
      name: "Emily Davis",
      image: "https://ui-avatars.com/api/?name=Emily+Davis&size=100&background=8b5cf6&color=fff",
      rating: 5,
      text: "We've used this service for all our trips and have never been disappointed.",
    },
    {
      id: 4,
      name: "David Wilson",
      image: "https://ui-avatars.com/api/?name=David+Wilson&size=100&background=f59e0b&color=fff",
      rating: 5,
      text: "Fantastic experience! The platform is user-friendly and offers great deals.",
    },
    {
      id: 5,
      name: "Jessica Martinez",
      image: "https://ui-avatars.com/api/?name=Jessica+Martinez&size=100&background=ec4899&color=fff",
      rating: 5,
      text: "Best travel booking site I've used. Highly recommend to everyone!",
    },
    {
      id: 6,
      name: "Robert Taylor",
      image: "https://ui-avatars.com/api/?name=Robert+Taylor&size=100&background=6366f1&color=fff",
      rating: 4,
      text: "Quick booking process and excellent customer support. Very satisfied!",
    },
  ];
  return (
    <div>
      <Helmet>
        <title>TELITRIP</title>
      </Helmet>
      <Header />
      <Slider />
              

      <div className="hotel-app ">
        {/* Hero Section */}

        {/* Featured Destinations */}
        <motion.section 
          className="py-12 md:py-16 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 underline"
              variants={isMobile ? fadeInUpMobile : fadeInUp}
            >
              Our Deals
            </motion.h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              variants={isMobile ? staggerContainerMobile : staggerContainer}
            >
              {featuredDestinations.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  variants={isMobile ? scaleInMobile : scaleIn}
                >
                  <DestinationCard
                    name={destination.name}
                    image={destination.image}
                    description={destination.description}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
        

        {/* Special Offers */}
        {/* <section className="py-16">
        <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Special Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {specialOffers.map((offer) => (
          <OfferCard 
          key={offer.id}
          title={offer.title}
          discount={offer.discount}
          image={offer.image}
          description={offer.description}
          />
          ))}
          </div>
        </div>
      </section> */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={isMobile ? fadeInUpMobile : fadeInUp}
        >
          <Accommodation />
        </motion.div>
        

        {/* Testimonials Carousel */}
        <TestimonialsCarousel testimonials={testimonials} isMobile={isMobile} />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={isMobile ? fadeInUpMobile : fadeInUp}
        >
          <Services />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={isMobile ? fadeInUpMobile : fadeInUp}
        >
          <Row01 />
        </motion.div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;
