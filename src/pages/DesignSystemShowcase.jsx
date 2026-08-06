import React from 'react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

const DesignSystemShowcase = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
      <h1 style={{ marginBottom: '8px' }}>Design System Showcase</h1>
      <p style={{ marginBottom: '32px', color: 'var(--color-text-secondary)' }}>
        Internal development environment for testing shared UI components.
      </p>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '24px' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="primary" isLoading>Loading State</Button>
          <Button variant="primary" disabled>Disabled State</Button>
        </div>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '24px' }}>Inputs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
          <Input label="Standard Input" placeholder="Enter text here..." />
          <Input label="Error State Input" placeholder="Invalid data..." error="This field is required." />
          <Input label="Disabled Input" placeholder="Cannot type here..." disabled />
        </div>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '24px' }}>Cards</h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Card style={{ padding: '24px', flex: 1, minWidth: '250px' }}>
            <h3>Standard Card</h3>
            <p>Default surface styling with standard borders and shadows.</p>
          </Card>
          <Card premium style={{ padding: '24px', flex: 1, minWidth: '250px' }}>
            <h3>Premium Card</h3>
            <p>Elevated surface with deeper shadows and hover states.</p>
          </Card>
        </div>
      </section>
      
      {/* 
        NOTE: Future components (Badge, Skeleton, Modal, Toast) 
        will be added here as they are fully built out.
      */}
    </div>
  );
};

export default DesignSystemShowcase;
