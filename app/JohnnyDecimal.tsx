'use client';

import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const JohnnyDecimalManager = () => {
  const [categories, setCategories] = useState([{ range: '10-19', name: '', areas: [] }]);
  const [activeTab, setActiveTab] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedID, setSelectedID] = useState(null);
  const [notes, setNotes] = useState({});

  const addCategory = () => {
    if (categories.length < 9) {
      const newRange = `${categories.length * 10 + 10}-${categories.length * 10 + 19}`;
      setCategories([...categories, { range: newRange, name: '', areas: [] }]);
    }
  };

  const updateCategory = (index, name) => {
    const newCategories = [...categories];
    newCategories[index].name = name;
    setCategories(newCategories);
  };

  const addArea = (categoryIndex) => {
    const newCategories = [...categories];
    const categoryStart = parseInt(categories[categoryIndex].range.split('-')[0]);
    const newAreaNumber = categoryStart + newCategories[categoryIndex].areas.length;
    if (newAreaNumber <= categoryStart + 9) {
      newCategories[categoryIndex].areas.push({ number: newAreaNumber, name: '', ids: [] });
      setCategories(newCategories);
    }
  };

  const updateArea = (categoryIndex, areaIndex, name) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].areas[areaIndex].name = name;
    setCategories(newCategories);
  };

  const addID = (categoryIndex, areaIndex) => {
    const newCategories = [...categories];
    const newID = {
      number: newCategories[categoryIndex].areas[areaIndex].ids.length + 1,
      name: ''
    };
    newCategories[categoryIndex].areas[areaIndex].ids.push(newID);
    setCategories(newCategories);
  };

  const updateID = (categoryIndex, areaIndex, idIndex, name) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].areas[areaIndex].ids[idIndex].name = name;
    setCategories(newCategories);
  };

  const updateNotes = (categoryIndex, areaIndex, idIndex, content) => {
    const key = `${categories[categoryIndex].areas[areaIndex].number}.${categories[categoryIndex].areas[areaIndex].ids[idIndex].number.toString().padStart(2, '0')}`;
    setNotes(prevNotes => ({ ...prevNotes, [key]: content }));
  };

  const resetAll = () => {
    setCategories([{ range: '10-19', name: '', areas: [] }]);
    setActiveTab('category');
    setSelectedCategory(0);
    setSelectedArea(null);
    setSelectedID(null);
    setNotes({});
  };

  const handleCategoryClick = (categoryIndex) => {
    setSelectedCategory(categoryIndex);
    setActiveTab('area');
    setSelectedArea(null);
    setSelectedID(null);
  };

  return (
    <div className="p-4 h-screen flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList>
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="area" disabled={selectedCategory === null}>Area</TabsTrigger>
          <TabsTrigger value="id" disabled={selectedArea === null}>ID</TabsTrigger>
        </TabsList>
        <TabsContent value="category" className="flex-grow overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, categoryIndex) => (
              <div 
                key={categoryIndex} 
                className={`border p-2 mb-2 ${selectedCategory === categoryIndex ? 'bg-blue-100' : ''} cursor-pointer flex-grow`}
                onClick={() => handleCategoryClick(categoryIndex)}
              >
                <div className="font-bold mb-2">{category.range} {category.name}</div>
                <Input
                  value={category.name}
                  onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                  placeholder="Enter category name"
                  className="w-full mb-2"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button onClick={(e) => {
                  e.stopPropagation();
                  addArea(categoryIndex);
                  setSelectedCategory(categoryIndex);
                  setActiveTab('area');
                }} disabled={category.areas.length >= 10}>
                  Add Area
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={addCategory} disabled={categories.length >= 9} className="mt-4">
            Add Category
          </Button>
        </TabsContent>
        <TabsContent value="area" className="flex-grow overflow-y-auto">
          {selectedCategory !== null && (
            <div className="flex flex-wrap gap-2">
              {categories[selectedCategory].areas.map((area, areaIndex) => (
                <div key={areaIndex} className={`border p-2 mb-2 ${selectedArea === areaIndex ? 'bg-blue-100' : ''} flex-grow`}>
                  <Button onClick={() => {
                    setSelectedArea(areaIndex);
                    setActiveTab('id');
                  }} className="mb-1 w-full">
                    {area.number} {area.name}
                  </Button>
                  <Input
                    value={area.name}
                    onChange={(e) => updateArea(selectedCategory, areaIndex, e.target.value)}
                    placeholder="Enter area name"
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="id" className="flex-grow overflow-y-auto">
          {selectedCategory !== null && selectedArea !== null && (
            <>
              {categories[selectedCategory].areas[selectedArea].ids.map((id, idIndex) => (
                <div key={idIndex} className={`border p-2 mb-2 ${selectedID === idIndex ? 'bg-blue-100' : ''}`}>
                  <Button onClick={() => setSelectedID(idIndex)} className="mb-1">
                    {categories[selectedCategory].areas[selectedArea].number}.{id.number.toString().padStart(2, '0')} {id.name}
                  </Button>
                  <Input
                    value={id.name}
                    onChange={(e) => updateID(selectedCategory, selectedArea, idIndex, e.target.value)}
                    placeholder="Enter ID name"
                    className="w-full mb-2"
                  />
                  <textarea
                    value={notes[`${categories[selectedCategory].areas[selectedArea].number}.${id.number.toString().padStart(2, '0')}`] || ''}
                    onChange={(e) => updateNotes(selectedCategory, selectedArea, idIndex, e.target.value)}
                    placeholder="Enter notes"
                    className="w-full h-32 p-2 border rounded"
                  />
                  <ReactMarkdown className="mt-2 p-2 bg-gray-100 rounded">
                    {notes[`${categories[selectedCategory].areas[selectedArea].number}.${id.number.toString().padStart(2, '0')}`] || ''}
                  </ReactMarkdown>
                </div>
              ))}
              <Button onClick={() => addID(selectedCategory, selectedArea)} disabled={categories[selectedCategory].areas[selectedArea].ids.length >= 100}>
                Add ID
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="mt-4">Reset</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your Johnny.Decimal structure and notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetAll}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JohnnyDecimalManager;
