import Footer from '@/pages/landing/Footer'
import Landing from '@/pages/landing/Landing'
import React from 'react'


const LandingLayout = () => {
    return (
        <div className='bg-background text-foreground opacity-95 '>
            <Landing />
            <Footer />
        </div>
    )
}

export default LandingLayout;