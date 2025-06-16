import React, { useState } from 'react'
import logo_dark from '@/assets/logo-white.png'
import logo_light from '@/assets/Logo.png'
import { ModeToggle } from '@/components/mode-toggle'
import { useTheme } from '@/components/theme-provider'
import { Link } from 'react-router-dom'

const Landing = () => {
    const { theme } = useTheme();

    return (
        <div className='xl:w-[1200px] mx-auto px-4'>
            <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-lg">
                <nav className="flex items-center justify-between p-4 xl:w-[1200px] mx-auto" aria-label="Global">
                    <div className="flex items-center">
                        <a href="#" className="-m-1.5">
                            <img
                                alt="logo"
                                src={theme === 'dark' ? logo_dark : logo_light}
                                className='dark:h-4 dark:sm:h-6 w-auto h-12 sm:h-16'
                            />
                        </a>
                    </div>

                    <div className="flex gap-4 items-center">
                        <Link to={'/role'} className="text-sm/6 font-semibold text-foreground px-2 py-1 bg-card rounded-md hover:scale-105">
                            Log in <span aria-hidden="true">&rarr;</span>
                        </Link>
                        <Link to={'/role'} className="text-sm/6 font-semibold text-foreground px-2 py-1 bg-card rounded-md hover:scale-105">
                            Sign up <span aria-hidden="true">&rarr;</span>
                        </Link>
                        <ModeToggle />
                    </div>

                </nav>
            </header>
            <div className="relative mt-24 sm:mt-10 min-h-[70vh] sm:min-h-[80vh] flex items-center bg-transparent">
                <div
                    className="absolute inset-x-0 -top-30 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    aria-hidden="true"
                >
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="mx-auto max-w-2xl pt-18 sm:pt-28 lg:pt-28 text-center">
                    <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
                        Courses to enrich Performance
                    </h1>
                    <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
                        Anim aute id magna aliqua ad ad non deserunt sunt...
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <a
                            href="#"
                            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                            Get started
                        </a>
                        <a href="#" className="text-sm font-semibold text-foreground">
                            Learn more <span aria-hidden="true">→</span>
                        </a>
                    </div>
                </div>

                <div
                    className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                    aria-hidden="true"
                >
                    <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-accent opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
                </div>
            </div>
        </div>


    )
}

export default Landing