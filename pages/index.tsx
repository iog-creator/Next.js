import React from 'react';
import Head from 'next/head';
import HebrewConverter from './hebrew-converter';

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <Head>
        <title>Hebrew Text to Sound Converter</title>
        <meta name="description" content="Convert Hebrew text to sound based on letter frequencies" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Hebrew Text to Sound Converter
        </h1>
        <HebrewConverter />
      </main>

      <footer className="mt-8 py-4 border-t text-center">
        <p>Hebrew Text to Sound Converter - Divine Patterns Research Project</p>
      </footer>
    </div>
  );
}