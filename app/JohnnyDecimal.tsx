'use client';

import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ReactMarkdown from 'react-markdown';

const JohnnyDecimalManager = () => {
  const [categories, setCategories] = useState([{ range: '10-19', name: '', areas: [] }]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedID, setSelectedID] = useState(null);
  const [notes, setNotes] = useState({});
  const [columnWidths, setColumnWidths] = useState(['33.33%', '33.33%', '33.33%']);

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
    const key = `${categoryIndex}-${areaIndex}-${idIndex}`;
    setNotes({ ...notes, [key]: content });
  };

  const startResize = (index) => (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidths = [...columnWidths];

    const doDrag = (e) => {
      const currentX = e.clientX;
      const diffX = currentX - startX;
      const newWidths = [...startWidths];
      const totalWidth = 100; // Total width in percentage
      const minWidth = 10; // Minimum width in percentage

      // Calculate new width for the column being resized
      let newWidth = Math.max(parseFloat(startWidths[index]) + (diffX / window.innerWidth) * 100, minWidth);
      newWidths[index] = `${newWidth}%`;

      // Adjust the next column's width
      if (index < newWidths.length - 1) {
        const nextColumnWidth = Math.max(parseFloat(startWidths[index + 1]) - (diffX / window.innerWidth) * 100, minWidth);
        newWidths[index + 1] = `${nextColumnWidth}%`;
      }

      // Ensure the total width remains 100%
      const sumWidth = newWidths.reduce((sum, width) => sum + parseFloat(width), 0);
      if (sumWidth > 100) {
        const excess = sumWidth - 100;
        newWidths[newWidths.length - 1] = `${parseFloat(newWidths[newWidths.length - 1]) - excess}%`;
      }

      setColumnWidths(newWidths);
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <div className="p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: columnWidths.join(' ') }}>
        <div className="font-bold p-2 bg-gray-100 relative">
          Category
          <div 
            className="absolute top-0 right-0 w-1 h-full bg-gray-300 hover:bg-gray-400 cursor-col-resize"
            onMouseDown={startResize(0)}
          ></div>
        </div>
        <div className="font-bold p-2 bg-gray-100 relative">
          Area
          <div 
            className="absolute top-0 right-0 w-1 h-full bg-gray-300 hover:bg-gray-400 cursor-col-resize"
            onMouseDown={startResize(1)}
          ></div>
        </div>
        <div className="font-bold p-2 bg-gray-100">ID</div>

        {categories.map((category, categoryIndex) => (
          <React.Fragment key={categoryIndex}>
            <div className="border p-2">
              <div>{category.range} {category.name}</div>
              <Input
                value={category.name}
                onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                placeholder="Enter category name"
                className="w-full mb-2"
              />
              <Button onClick={() => addArea(categoryIndex)} disabled={category.areas.length >= 10}>
                Add Area
              </Button>
            </div>
            <div className="border p-2">
              {category.areas.map((area, areaIndex) => (
                <div key={areaIndex} className="mb-2">
                  <Button onClick={() => {
                    setSelectedCategory(categoryIndex);
                    setSelectedArea(areaIndex);
                  }} className="mb-1">
                    {area.number} {area.name}
                  </Button>
                  <Input
                    value={area.name}
                    onChange={(e) => updateArea(categoryIndex, areaIndex, e.target.value)}
                    placeholder="Enter area name"
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <div className="border p-2">
              {selectedCategory === categoryIndex && selectedArea !== null && (
                <>
                  {category.areas[selectedArea].ids.map((id, idIndex) => (
                    <div key={idIndex} className="mb-2">
                      <Button onClick={() => setSelectedID(idIndex)} className="mb-1">
                        {category.areas[selectedArea].number}.{id.number.toString().padStart(2, '0')} {id.name}
                      </Button>
                      <Input
                        value={id.name}
                        onChange={(e) => updateID(categoryIndex, selectedArea, idIndex, e.target.value)}
                        placeholder="Enter ID name"
                        className="w-full"
                      />
                    </div>
                  ))}
                  <Button onClick={() => addID(categoryIndex, selectedArea)} 
                          disabled={category.areas[selectedArea].ids.length >= 99}>
                    Add ID
                  </Button>
                </>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      <Button onClick={addCategory} disabled={categories.length >= 9} className="mt-4">
        Add Category
      </Button>

      {selectedCategory !== null && selectedArea !== null && selectedID !== null && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="mt-4">Edit Notes</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Notes</AlertDialogTitle>
              <AlertDialogDescription>
                Enter your notes in Markdown format:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={notes[`${selectedCategory}-${selectedArea}-${selectedID}`] || ''}
              onChange={(e) => updateNotes(selectedCategory, selectedArea, selectedID, e.target.value)}
              placeholder="Enter notes (Markdown supported)"
              className="mt-2"
            />
            <AlertDialogFooter>
              <AlertDialogAction>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {selectedCategory !== null && selectedArea !== null && selectedID !== null && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Notes:</h3>
          <ReactMarkdown>
            {notes[`${selectedCategory}-${selectedArea}-${selectedID}`] || ''}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default JohnnyDecimalManager;