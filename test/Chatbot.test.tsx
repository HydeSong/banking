import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import Chatbot from '../components/Chatbot';

describe('Chatbot', () => {
  it('renders the initial bot message', () => {
    render(<Chatbot />);
    expect(screen.getByText("Hi! I'm here to help. What can I do for you?")).toBeInTheDocument();
  });

  it('sends a user message and displays it', () => {
    render(<Chatbot />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('responds to a user message with a predefined response', async () => {
    render(<Chatbot />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');
    
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.click(sendButton);
    
    // Wait for the bot's response
    await screen.findByText('Hello! How can I assist you today?');
    expect(screen.getByText('Hello! How can I assist you today?')).toBeInTheDocument();
  });

  it('responds to a user message with the default response', async () => {
    render(<Chatbot />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');
    
    fireEvent.change(input, { target: { value: 'unknown message' } });
    fireEvent.click(sendButton);
    
    // Wait for the bot's response
    await screen.findByText("I understand you're asking about that. Let me connect you with a human agent.");
    expect(screen.getByText("I understand you're asking about that. Let me connect you with a human agent.")).toBeInTheDocument();
  });
});