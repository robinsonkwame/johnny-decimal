'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import JohnnyDecimalManager from './JohnnyDecimal';

interface Section {
  id: number;
  name: string;
  isChecked: boolean;
  selectedIDs: string[];
}

interface CombinedState {
  paperSections: Section[];
  johnnyDecimal: {
    categories: Category[];
    selectedCategory: number | null;
    selectedArea: number | null;
    selectedID: number | null;
    activeTab: 'category' | 'area' | 'id';
  };
}

const PaperSections: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([
    { id: 1, name: 'Abstract', isChecked: false, selectedIDs: [] },
    { id: 2, name: 'Introduction', isChecked: false, selectedIDs: [] },
  ]);
  const [activeJohnnyDecimalID, setActiveJohnnyDecimalID] = useState<{ category: number, area: number, id: number } | null>(null);
  const [johnnyDecimalState, setJohnnyDecimalState] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load combined state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('combinedState');
    if (savedState) {
      const parsedState: CombinedState = JSON.parse(savedState);
      setSections(parsedState.paperSections);
    }
  }, []);

  // Save combined state to localStorage whenever sections change
  useEffect(() => {
    const johnnyDecimalState = localStorage.getItem('johnnyDecimalState');
    const combinedState: CombinedState = {
      paperSections: sections,
      johnnyDecimal: johnnyDecimalState ? JSON.parse(johnnyDecimalState) : null,
    };
    localStorage.setItem('combinedState', JSON.stringify(combinedState));
  }, [sections]);

  const saveStateToFile = () => {
    const johnnyDecimalState = localStorage.getItem('johnnyDecimalState');
    const combinedState: CombinedState = {
      paperSections: sections,
      johnnyDecimal: johnnyDecimalState ? JSON.parse(johnnyDecimalState) : null,
    };
    const stateJson = JSON.stringify(combinedState, null, 2);
    const blob = new Blob([stateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paper_sections_and_johnny_decimal_state.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadStateFromFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const file = await fileHandle.getFile();
      const contents = await file.text();
      const loadedState: CombinedState = JSON.parse(contents);
      
      console.log('Loaded state from file:', loadedState);

      if (loadedState.paperSections) {
        setSections(loadedState.paperSections);
        console.log('Updated paper sections:', loadedState.paperSections);
      }
      if (loadedState.johnnyDecimal) {
        setJohnnyDecimalState(loadedState.johnnyDecimal);
        console.log('Updated Johnny Decimal state:', loadedState.johnnyDecimal);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleJohnnyDecimalStateChange = (newState: any) => {
    console.log('Johnny Decimal state changed:', newState);
    setJohnnyDecimalState(newState);
  };

  const refreshJohnnyDecimal = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const addSection = () => {
    const newId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    setSections([...sections, { id: newId, name: '', isChecked: false, selectedIDs: [] }]);
  };

  const removeSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const updateSectionName = (id: number, name: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, name } : section
    ));
  };

  const toggleSectionCheck = (id: number, checked: boolean) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, isChecked: checked } : section
    ));
  };

  const handleIDSelect = (id: string) => {
    setSections(sections.map(section => 
      section.isChecked ? { ...section, selectedIDs: [...new Set([...section.selectedIDs, id])] } : section
    ));
    setActiveJohnnyDecimalID(null);
  };

  const handleSelectedIDClick = (id: string) => {
    const [category, areaId] = id.split('.');
    const categoryIndex = Math.floor(parseInt(category) / 10);
    const areaIndex = parseInt(category) % 10;
    const idIndex = parseInt(areaId) - 1;
    setActiveJohnnyDecimalID({ category: categoryIndex, area: areaIndex, id: idIndex });
  };

  const removeIDFromSection = (sectionId: number, idToRemove: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, selectedIDs: section.selectedIDs.filter(id => id !== idToRemove) } : section
    ));
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex">
        {/* Left column */}
        <div className="w-1/2 p-4 border-r">
          <h2 className="text-xl font-bold mb-4">Paper Sections</h2>
          {sections.map(section => (
            <div key={section.id} className="flex items-center mb-2">
              <Checkbox
                id={`checkbox-${section.id}`}
                checked={section.isChecked}
                onCheckedChange={(checked) => toggleSectionCheck(section.id, checked as boolean)}
                className="mr-2"
              />
              <Input
                value={section.name}
                onChange={(e) => updateSectionName(section.id, e.target.value)}
                placeholder="Enter section name"
                className="flex-grow mr-2"
              />
              <Button onClick={() => removeSection(section.id)} variant="destructive" size="sm">-</Button>
            </div>
          ))}
          <Button onClick={addSection} className="mt-2" size="sm">+</Button>
        </div>

        {/* Right column */}
        <div className="w-1/2 p-4">
          <JohnnyDecimalManager 
            key={refreshTrigger}
            onIDSelect={handleIDSelect} 
            activeJohnnyDecimalID={activeJohnnyDecimalID} 
            onStateChange={handleJohnnyDecimalStateChange}
            initialState={johnnyDecimalState || null}
          />
        </div>
      </div>

      {/* Selected ID display */}
      <div className="p-4 bg-gray-100">
        <h3 className="text-lg font-semibold mb-2">Selected IDs for sections:</h3>
        {sections.filter(s => s.selectedIDs.length > 0).map(section => (
          <div key={section.id} className="mb-1 flex items-center">
            <span className="mr-2">{section.name}:</span>
            {section.selectedIDs.map(id => (
              <div key={id} className="flex items-center mr-2">
                <Button 
                  onClick={() => handleSelectedIDClick(id)} 
                  variant="outline" 
                  size="sm"
                  className="mr-1"
                >
                  {id}
                </Button>
                <Button 
                  onClick={() => removeIDFromSection(section.id, id)} 
                  variant="ghost" 
                  size="sm"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex space-x-2">
        <Button onClick={saveStateToFile}>Save to File</Button>
        <Button onClick={loadStateFromFile}>Load from File</Button>
        <Button onClick={refreshJohnnyDecimal}>Refresh Johnny Decimal</Button>
      </div>
    </div>
  );
};

export default PaperSections;