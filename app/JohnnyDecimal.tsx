import React, { useReducer, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type ID = { number: number; name: string };
type Area = { number: number; name: string; ids: ID[] };
type Category = { range: string; name: string; areas: Area[] };

type State = {
  categories: Category[];
  selectedCategory: number | null;
  selectedArea: number | null;
  selectedID: number | null;
  activeTab: 'category' | 'area' | 'id';
};

type Action =
  | { type: 'ADD_CATEGORY' }
  | { type: 'ADD_AREA'; categoryIndex: number }
  | { type: 'ADD_ID'; categoryIndex: number; areaIndex: number }
  | { type: 'SELECT_CATEGORY'; index: number }
  | { type: 'SELECT_AREA'; categoryIndex: number; index: number }
  | { type: 'SELECT_ID'; categoryIndex: number; areaIndex: number; index: number }
  | { type: 'UPDATE_CATEGORY'; index: number; name: string }
  | { type: 'UPDATE_AREA'; categoryIndex: number; areaIndex: number; name: string }
  | { type: 'UPDATE_ID'; categoryIndex: number; areaIndex: number; idIndex: number; name: string }
  | { type: 'RESET' }
  | { type: 'SET_ACTIVE_TAB'; tab: 'category' | 'area' | 'id' }
  | { type: 'LOAD_STATE'; state: State };

const defaultState: State = {
  categories: [],
  selectedCategory: null,
  selectedArea: null,
  selectedID: null,
  activeTab: 'category',
};

function reducer(state: State, action: Action): State {
  console.log('Reducer called with action:', action.type, action);
  
  switch (action.type) {
    case 'ADD_CATEGORY':
      if (state.categories.length >= 10) {
        console.log("Maximum categories reached");
        return state;
      }
      const newCategoryIndex = state.categories.length;
      const newRange = `${newCategoryIndex}0-${newCategoryIndex}9`;
      return {
        ...state,
        categories: [...state.categories, { range: newRange, name: '', areas: [{ number: newCategoryIndex * 10, name: '', ids: [] }] }],
        selectedCategory: newCategoryIndex,
        selectedArea: 0,
        selectedID: null,
        activeTab: 'category'
      };

    case 'ADD_AREA':
      if (state.categories[action.categoryIndex].areas.length >= 10) {
        console.log("Maximum areas reached for this category");
        return state;
      }
      const newAreaNumber = state.categories[action.categoryIndex].areas.length + action.categoryIndex * 10;
      return {
        ...state,
        categories: state.categories.map((category, index) =>
          index === action.categoryIndex
            ? { ...category, areas: [...category.areas, { number: newAreaNumber, name: '', ids: [] }] }
            : category
        ),
        selectedArea: state.categories[action.categoryIndex].areas.length,
        selectedID: null,
        activeTab: 'area'
      };

    case 'ADD_ID':
      if (state.categories[action.categoryIndex].areas[action.areaIndex].ids.length >= 99) {
        console.log("Maximum IDs reached for this area");
        return state;
      }
      const newIDNumber = state.categories[action.categoryIndex].areas[action.areaIndex].ids.length + 1;
      return {
        ...state,
        categories: state.categories.map((category, cIndex) =>
          cIndex === action.categoryIndex
            ? {
                ...category,
                areas: category.areas.map((area, aIndex) =>
                  aIndex === action.areaIndex
                    ? { ...area, ids: [...area.ids, { number: newIDNumber, name: '' }] }
                    : area
                )
              }
            : category
        ),
        selectedID: newIDNumber - 1,
        activeTab: 'id'
      };

    case 'SELECT_CATEGORY':
      return {
        ...state,
        selectedCategory: action.index,
        selectedArea: 0,
        selectedID: null,
        activeTab: 'category'
      };

    case 'SELECT_AREA':
      return {
        ...state,
        selectedCategory: action.categoryIndex,
        selectedArea: action.index,
        selectedID: null,
        activeTab: 'area'
      };

    case 'SELECT_ID':
      return {
        ...state,
        selectedCategory: action.categoryIndex,
        selectedArea: action.areaIndex,
        selectedID: action.index,
        activeTab: 'id'
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((category, index) =>
          index === action.index ? { ...category, name: action.name } : category
        )
      };

    case 'UPDATE_AREA':
      return {
        ...state,
        categories: state.categories.map((category, cIndex) =>
          cIndex === action.categoryIndex
            ? {
                ...category,
                areas: category.areas.map((area, aIndex) =>
                  aIndex === action.areaIndex ? { ...area, name: action.name } : area
                )
              }
            : category
        )
      };

    case 'UPDATE_ID':
      return {
        ...state,
        categories: state.categories.map((category, cIndex) =>
          cIndex === action.categoryIndex
            ? {
                ...category,
                areas: category.areas.map((area, aIndex) =>
                  aIndex === action.areaIndex
                    ? {
                        ...area,
                        ids: area.ids.map((id, iIndex) =>
                          iIndex === action.idIndex ? { ...id, name: action.name } : id
                        )
                      }
                    : area
                )
              }
            : category
        )
      };

    case 'RESET':
      return defaultState;

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab };

    case 'LOAD_STATE':
      console.log('LOAD_STATE action dispatched:', action.state);
      const newState = {
        ...action.state,
        selectedCategory: action.state.selectedCategory ?? null,
        selectedArea: action.state.selectedArea ?? null,
        selectedID: action.state.selectedID ?? null,
        activeTab: action.state.activeTab || 'category'
      };
      console.log('New state after LOAD_STATE:', newState);
      return newState;

    default:
      return state;
  }
}

interface JohnnyDecimalManagerProps {
  onIDSelect: (id: string) => void;
  activeJohnnyDecimalID: { category: number, area: number, id: number } | null;
  onStateChange: (state: State) => void;
  initialState: State | null;
}

const JohnnyDecimalManager: React.FC<JohnnyDecimalManagerProps> = ({ onIDSelect, activeJohnnyDecimalID, onStateChange, initialState }) => {
  console.log('JohnnyDecimalManager rendered with initialState:', initialState);

  const [state, dispatch] = useReducer(reducer, initialState || defaultState);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (initialState && !isInitialized.current) {
      console.log('Dispatching LOAD_STATE with:', initialState);
      dispatch({ type: 'LOAD_STATE', state: initialState });
      isInitialized.current = true;
    }
  }, [initialState]);

  useEffect(() => {
    console.log('Johnny Decimal state updated:', state);
    if (isInitialized.current) {
      localStorage.setItem('johnnyDecimalState', JSON.stringify(state));
      onStateChange(state);
    }
  }, [state, onStateChange]);

  useEffect(() => {
    console.log('activeJohnnyDecimalID changed:', activeJohnnyDecimalID);
    if (activeJohnnyDecimalID) {
      dispatch({ type: 'SELECT_ID', categoryIndex: activeJohnnyDecimalID.category, areaIndex: activeJohnnyDecimalID.area, index: activeJohnnyDecimalID.id });
    }
  }, [activeJohnnyDecimalID]);

  const handleIDClick = (categoryIndex: number, areaIndex: number, idIndex: number) => {
    dispatch({ type: 'SELECT_ID', categoryIndex, areaIndex, index: idIndex });
    const area = state.categories[categoryIndex].areas[areaIndex];
    const id = `${area.number}.${area.ids[idIndex].number.toString().padStart(2, '0')}`;
    onIDSelect(id);
  };

  return (
    <div className="p-4 h-screen flex flex-col" key={JSON.stringify(state)}>
      <Tabs value={state.activeTab} onValueChange={(value) => dispatch({ type: 'SET_ACTIVE_TAB', tab: value as 'category' | 'area' | 'id' })} className="flex-grow flex flex-col">
        <TabsList>
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="area" disabled={state.selectedCategory === null}>Area</TabsTrigger>
          <TabsTrigger value="id" disabled={state.selectedArea === null}>ID</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="flex-grow overflow-y-auto">
          {/* Render categories */}
          {state.categories.map((category, index) => (
            <div key={index} className={`border p-2 mb-2 ${state.selectedCategory === index ? 'bg-blue-100' : ''}`} onClick={() => dispatch({ type: 'SELECT_CATEGORY', index })}>
              <div className="font-bold">{category.range} {category.name}</div>
              <Input
                value={category.name}
                onChange={(e) => dispatch({ type: 'UPDATE_CATEGORY', index, name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter category name"
              />
              <Button onClick={() => dispatch({ type: 'ADD_AREA', categoryIndex: index })} disabled={category.areas.length >= 10}>Add Area</Button>
            </div>
          ))}
          <Button onClick={() => dispatch({ type: 'ADD_CATEGORY' })} disabled={state.categories.length >= 10}>Add Category</Button>
        </TabsContent>

        <TabsContent value="area" className="flex-grow overflow-y-auto">
          {/* Render areas */}
          {state.selectedCategory !== null && state.categories[state.selectedCategory].areas.map((area, index) => (
            <div key={index} className={`border p-2 mb-2 ${state.selectedArea === index ? 'bg-blue-100' : ''}`} onClick={() => dispatch({ type: 'SELECT_AREA', categoryIndex: state.selectedCategory!, index })}>
              <div className="font-bold">{area.number} {area.name}</div>
              <Input
                value={area.name}
                onChange={(e) => dispatch({ type: 'UPDATE_AREA', categoryIndex: state.selectedCategory!, areaIndex: index, name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter area name"
              />
              <Button onClick={() => dispatch({ type: 'ADD_ID', categoryIndex: state.selectedCategory!, areaIndex: index })} disabled={area.ids.length >= 99}>Add ID</Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="id" className="flex-grow overflow-y-auto">
          {/* Render IDs */}
          {state.selectedCategory !== null && state.selectedArea !== null && state.categories[state.selectedCategory].areas[state.selectedArea].ids.map((id, index) => (
            <div key={index} className={`border p-2 mb-2 ${state.selectedID === index ? 'bg-blue-100' : ''}`} onClick={() => handleIDClick(state.selectedCategory!, state.selectedArea!, index)}>
              <div className="font-bold">{state.categories[state.selectedCategory].areas[state.selectedArea].number}.{id.number.toString().padStart(2, '0')} {id.name}</div>
              <Input
                value={id.name}
                onChange={(e) => dispatch({ type: 'UPDATE_ID', categoryIndex: state.selectedCategory!, areaIndex: state.selectedArea!, idIndex: index, name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter ID name"
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex space-x-2">
        <Button onClick={() => dispatch({ type: 'RESET' })}>Reset</Button>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="mt-4">Reset</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your Johnny.Decimal structure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => dispatch({ type: 'RESET' })}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <pre className="mt-4 p-2 bg-gray-100 text-xs">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
};

export default JohnnyDecimalManager;