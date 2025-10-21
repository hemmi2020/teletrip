import React, { Suspense, lazy } from "react";
import { useState } from "react";
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const Home = () => {

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
          className="py-16 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold text-center mb-12 underline"
              variants={fadeInUp}
            >
              Our Deals
            </motion.h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
            >
              {featuredDestinations.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  variants={scaleIn}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
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
          variants={fadeInUp}
        >
          <Accommodation />
        </motion.div>
        

        {/* Testimonials */}
        <motion.section 
          className="py-16 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold text-center mb-12 underline"
              variants={fadeInUp}
            >
              What Our Customers Say
            </motion.h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
            >
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                >
                  <TestimonialCard
                    name={testimonial.name}
                    image={testimonial.image}
                    rating={testimonial.rating}
                    text={testimonial.text}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <Services />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <Row01 />
        </motion.div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;
