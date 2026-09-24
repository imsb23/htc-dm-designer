
import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { 
  Database, 
  Layers, 
  Plus, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Focus,
  Sparkles,
  Zap,
  Table as TableIcon,
  Workflow,
  Link as LinkIcon,
  MousePointer2,
  Maximize,
  Edit2,
  Check,
  Code,
  Eye,
  Info
} from 'lucide-react';
import { Node, Edge, DesignData, ArchitectureCanvasHandle, DiagramClassification } from '../types';

interface ArchitectureCanvasProps {
  aiNodes: Node[];
  aiEdges: Edge[];
  isThinking: boolean;
  thoughts: string[];
  classification?: DiagramClassification;
  mermaidCode?: string;
  onDesignChange?: (newDesign: DesignData) => void;
  onMermaidChange?: (code: string) => void;
  onSelectNode?: (nodeId: string | null) => void;
  onAddNode?: (type: Node['type'], x: number, y: number) => void;
  readOnly?: boolean;
  isLinkingMode?: boolean;
  selectedNodeId?: string | null;
}

export const getNodeColor = (type: string) => {
    switch(type) {
        case 'database':
        case 'sqlserver':
        case 'sap':
            return { bg: 'fill-[#fefce8]', border: 'stroke-[#eab308]', header: 'bg-[#fef9c3]', text: 'fill-[#854d0e]', accent: '#eab308' };
        case 'storage':
        case 'cloud':
            return { bg: 'fill-[#f0f9ff]', border: 'stroke-[#0ea5e9]', header: 'bg-[#e0f2fe]', text: 'fill-[#0369a1]', accent: '#0ea5e9' };
        case 'table':
        case 'simple_table':
            return { bg: 'fill-white', border: 'stroke-[#22c55e]', header: 'bg-[#f0fdf4]', text: 'fill-[#166534]', line: 'stroke-[#bbf7d0]', accent: '#22c55e' };
        case 'decision':
            return { bg: 'fill-[#fff1f2]', border: 'stroke-[#f43f5e]', header: 'bg-[#ffe4e6]', text: 'fill-[#9f1239]', accent: '#f43f5e' };
        case 'terminal':
            return { bg: 'fill-slate-50', border: 'stroke-slate-400', header: 'bg-slate-100', text: 'fill-slate-700', accent: '#64748b' };
        case 'api': 
        case 'gateway':
        case 'web':
            return { bg: 'fill-[#eff6ff]', border: 'stroke-[#3b82f6]', header: 'bg-[#dbeafe]', text: 'fill-[#1e40af]', accent: '#3b82f6' };
        case 'process':
        case 'stage':
        case 'complex':
        case 'server':
            return { bg: 'fill-[#f0fdf4]', border: 'stroke-[#22c55e]', header: 'bg-[#dcfce7]', text: 'fill-[#166534]', accent: '#22c55e' };
        case 'container':
            return { bg: 'fill-[#f8fafc]', border: 'stroke-slate-300', header: 'bg-slate-100', text: 'fill-slate-500', accent: '#94a3b8' };
        default: 
            return { bg: 'fill-white', border: 'stroke-slate-300', header: 'bg-slate-50', text: 'fill-slate-600', accent: '#64748b' };
    }
};

const getAnchors = (node: Node) => {
    const w = node.width || 180;
    const h = node.height || 80;
    return [
        { x: node.x + w / 2, y: node.y, id: 'top' },
        { x: node.x + w, y: node.y + h / 2, id: 'right' },
        { x: node.x + w / 2, y: node.y + h, id: 'bottom' },
        { x: node.x, y: node.y + h / 2, id: 'left' }
    ];
};

const getConnectionPoint = (node: Node, targetCenter: {x: number, y: number}) => {
    const w = node.width || 180;
    const h = node.height || 80;
    const center = { x: node.x + w / 2, y: node.y + h / 2 };
    const dx = targetCenter.x - center.x;
    const dy = targetCenter.y - center.y;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) return { x: node.x + w, y: center.y, dir: 'right' }; 
        return { x: node.x, y: center.y, dir: 'left' }; 
    } else {
        if (dy > 0) return { x: center.x, y: node.y + h, dir: 'bottom' }; 
        return { x: center.x, y: node.y, dir: 'top' }; 
    }
};

const getBestConnectionPoints = (source: Node, target: Node) => {
    const sW = source.width || 180; 
    const sH = source.height || 80;
    const tCenter = { x: target.x + (target.width || 180) / 2, y: target.y + (target.height || 80) / 2 };
    const sCenter = { x: source.x + sW / 2, y: source.y + sH / 2 };
    return { start: getConnectionPoint(source, tCenter), end: getConnectionPoint(target, sCenter) };
};

const calculateSmartPath = (start: {x: number, y: number, dir?: string}, end: {x: number, y: number, dir?: string}) => {
    const midY = (start.y + end.y) / 2;
    return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
};

const ArchitectureCanvas = forwardRef<ArchitectureCanvasHandle, ArchitectureCanvasProps>(({ 
  aiNodes = [], aiEdges = [], isThinking, thoughts, classification, mermaidCode = '', onDesignChange, onMermaidChange, onSelectNode, onAddNode, readOnly = false, isLinkingMode = false, selectedNodeId: externalSelectedNodeId
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  
  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<string | null>(null);
  const [linkPreview, setLinkPreview] = useState<{ fromId: string, startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState<number | null>(null);
  const [editingEdgeIndex, setEditingEdgeIndex] = useState<number | null>(null);
  const [edgeLabelInput, setEdgeLabelInput] = useState('');
  
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeLabelInput, setNodeLabelInput] = useState('');
  const [isCodeView, setIsCodeView] = useState(false);

  // Tooltip state
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const selectedNodeId = externalSelectedNodeId !== undefined ? externalSelectedNodeId : internalSelectedNodeId;

  useImperativeHandle(ref, () => ({
    exportImage: (format: 'png' | 'svg') => {
        alert(`Exporting high-fidelity ${format.toUpperCase()}...`);
    }
  }));

  const nodes = Array.isArray(aiNodes) ? aiNodes : [];
  const edges = Array.isArray(aiEdges) ? aiEdges : [];

  const handleAutoFit = () => {
    if (nodes.length === 0 || !containerRef.current) return;
    const padding = 100;
    const rect = containerRef.current.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(n => {
        const w = n.width || (n.type === 'simple_table' || n.type === 'table' ? 300 : 180);
        const h = n.height || (n.type === 'simple_table' || n.type === 'table' ? 150 : 80);
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + w);
        maxY = Math.max(maxY, n.y + h);
    });

    const diagramCenterX = (minX + maxX) / 2;
    const diagramCenterY = (minY + maxY) / 2;
    const contentWidth = maxX - minX + (padding * 2);
    const contentHeight = maxY - minY + (padding * 2);

    const zoomX = rect.width / contentWidth;
    const zoomY = rect.height / contentHeight;
    
    let newZoom = Math.min(zoomX, zoomY);
    newZoom = Math.max(0.2, Math.min(newZoom, 1.2));
    
    setZoom(newZoom);
    setPan({ x: (rect.width / 2) - (diagramCenterX * newZoom), y: (rect.height / 2) - (diagramCenterY * newZoom) });
  };

  useEffect(() => { 
    if (nodes.length > 0 && !draggedNodeId) {
        const timer = setTimeout(handleAutoFit, 150);
        return () => clearTimeout(timer);
    }
  }, [classification, nodes.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
      if (readOnly || !containerRef.current || isCodeView) return;
      const rect = containerRef.current.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;

      // Check if clicked near an anchor for linking
      let hitAnchorNode: Node | null = null;
      let hitAnchorPos: {x: number, y: number} | null = null;

      for (const node of nodes) {
          const anchors = getAnchors(node);
          const found = anchors.find(a => Math.sqrt((worldX - a.x)**2 + (worldY - a.y)**2) < 15);
          if (found) {
              hitAnchorNode = node;
              hitAnchorPos = { x: found.x, y: found.y };
              break;
          }
      }

      if (hitAnchorNode && hitAnchorPos) {
          setLinkPreview({
              fromId: hitAnchorNode.id,
              startX: hitAnchorPos.x,
              startY: hitAnchorPos.y,
              currentX: worldX,
              currentY: worldY
          });
          return;
      }

      const hitNode = [...nodes].reverse().find(n => {
          const w = n.width || 180;
          const h = n.height || 80;
          return worldX >= n.x && worldX <= n.x + w && worldY >= n.y && worldY <= n.y + h;
      });

      if (hitNode) {
          setDraggedNodeId(hitNode.id);
          setInternalSelectedNodeId(hitNode.id);
          onSelectNode?.(hitNode.id);
          setSelectedEdgeIndex(null);
          setEditingEdgeIndex(null);
          setEditingNodeId(null);
          dragOffsetRef.current = { x: worldX - hitNode.x, y: worldY - hitNode.y };
      } else {
          setIsPanning(true);
          setInternalSelectedNodeId(null);
          onSelectNode?.(null);
          setSelectedEdgeIndex(null);
          setEditingEdgeIndex(null);
          setEditingNodeId(null);
          dragOffsetRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current || isCodeView) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      setMousePos({ x: e.clientX, y: e.clientY });

      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;

      if (linkPreview) {
          setLinkPreview({ ...linkPreview, currentX: worldX, currentY: worldY });
      } else if (draggedNodeId && onDesignChange) {
          const newNodes = nodes.map(n => n.id === draggedNodeId ? { ...n, x: worldX - dragOffsetRef.current.x, y: worldY - dragOffsetRef.current.y } : n);
          onDesignChange({ nodes: newNodes, edges: edges });
      } else if (isPanning) {
          setPan({ x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y });
      }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isCodeView) return;
    if (linkPreview && onDesignChange && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const worldX = (e.clientX - rect.left - pan.x) / zoom;
        const worldY = (e.clientY - rect.top - pan.y) / zoom;

        const targetNode = nodes.find(node => {
            const anchors = getAnchors(node);
            return anchors.some(a => Math.sqrt((worldX - a.x)**2 + (worldY - a.y)**2) < 20);
        });

        if (targetNode && targetNode.id !== linkPreview.fromId) {
            onDesignChange({
                nodes,
                edges: [...edges, { from: linkPreview.fromId, to: targetNode.id, label: 'New Link' }]
            });
        }
    }
    setLinkPreview(null);
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
      if (!containerRef.current || isCodeView) return;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(3, Math.max(0.1, zoom * delta));
      const rect = containerRef.current.getBoundingClientRect();
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - pan.x) / zoom;
      const worldY = (mouseY - pan.y) / zoom;

      setZoom(newZoom);
      setPan({ 
          x: mouseX - worldX * newZoom, 
          y: mouseY - worldY * newZoom 
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly || !containerRef.current || !onAddNode || isCodeView) return;
    const nodeType = e.dataTransfer.getData('nodeType') as Node['type'];
    if (!nodeType) return;
    const rect = containerRef.current.getBoundingClientRect();
    const worldX = (e.clientX - rect.left - pan.x) / zoom;
    const worldY = (e.clientY - rect.top - pan.y) / zoom;
    onAddNode(nodeType, worldX - 90, worldY - 40);
  };

  const handleLabelDoubleClick = (index: number, currentLabel: string) => {
      setEditingEdgeIndex(index);
      setEdgeLabelInput(currentLabel);
  };

  const saveEdgeLabel = () => {
      if (editingEdgeIndex !== null && onDesignChange) {
          const newEdges = [...edges];
          newEdges[editingEdgeIndex] = { ...newEdges[editingEdgeIndex], label: edgeLabelInput };
          onDesignChange({ nodes, edges: newEdges });
      }
      setEditingEdgeIndex(null);
  };

  const handleNodeDoubleClick = (nodeId: string, currentLabel: string) => {
      setEditingNodeId(nodeId);
      setNodeLabelInput(currentLabel);
  };

  const saveNodeLabel = () => {
      if (editingNodeId !== null && onDesignChange) {
          const newNodes = nodes.map(n => n.id === editingNodeId ? { ...n, label: nodeLabelInput } : n);
          onDesignChange({ nodes: newNodes, edges });
      }
      setEditingNodeId(null);
  };

  const containerNodes = useMemo(() => nodes.filter(n => n.type === 'container'), [nodes]);
  const standardNodes = useMemo(() => nodes.filter(n => n.type !== 'container'), [nodes]);

  return (
    <div 
        className={`w-full h-full relative bg-[#f8fafc] overflow-hidden studio-canvas-svg ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`} 
        ref={containerRef} 
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove} 
        onMouseUp={handleMouseUp} 
        onMouseLeave={(e) => { handleMouseUp(e); setHoveredNode(null); }}
        onWheel={handleWheel}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
    >
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(#94a3b8 1px, transparent 0)`, backgroundSize: '32px 32px' }}></div>
      
      {isCodeView ? (
          <div className="h-full w-full bg-slate-900 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                  <div>
                      <h3 className="text-white font-bold text-lg">Mermaid Code Source</h3>
                      <p className="text-slate-500 text-xs uppercase tracking-widest font-black mt-1">Logic-First Representation</p>
                  </div>
              </div>
              <textarea 
                  className="flex-1 bg-slate-950 text-indigo-400 p-8 font-mono text-sm leading-relaxed outline-none rounded-xl border border-slate-800 shadow-inner resize-none custom-scrollbar" 
                  value={mermaidCode} 
                  onChange={(e) => onMermaidChange?.(e.target.value)}
                  spellCheck={false}
              />
          </div>
      ) : (
          <svg width="100%" height="100%" className="w-full h-full select-none">
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
              </marker>
            </defs>
            
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transition: draggedNodeId ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {containerNodes.map(node => (
                    <g 
                      key={node.id} 
                      onClick={() => { setInternalSelectedNodeId(node.id); onSelectNode?.(node.id); }}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                        <rect 
                            x={node.x} y={node.y} width={node.width || 480} height={node.height || 380} rx="12" 
                            className={`fill-white/20 stroke-[1.5px] transition-all duration-200 ${selectedNodeId === node.id ? 'stroke-indigo-500 fill-indigo-50/10' : 'stroke-slate-200'}`} 
                        />
                        <text x={node.x + 16} y={node.y + 24} className="fill-slate-400 font-bold text-[10px] uppercase tracking-widest">{node.label}</text>
                    </g>
                ))}

                {edges.map((edge, i) => {
                    const source = nodes.find(n => n.id === edge.from);
                    const target = nodes.find(n => n.id === edge.to);
                    if (!source || !target) return null;
                    const { start, end } = getBestConnectionPoints(source, target);
                    const isSelected = selectedEdgeIndex === i;
                    
                    return (
                    <g key={i} onClick={(e) => { e.stopPropagation(); setSelectedEdgeIndex(i); setInternalSelectedNodeId(null); onSelectNode?.(null); }}>
                        <path 
                            d={calculateSmartPath(start, end)} 
                            stroke={isSelected ? "#6366f1" : "#cbd5e1"} 
                            strokeWidth={isSelected ? 2.5 : 1.5} 
                            fill="none" 
                            markerEnd="url(#arrowhead)" 
                            className="transition-all cursor-pointer hover:stroke-indigo-300"
                        />
                        <foreignObject x={(start.x + end.x) / 2 - 60} y={(start.y + end.y) / 2 - 15} width="120" height="30" onDoubleClick={() => handleLabelDoubleClick(i, edge.label)}>
                            <div className="w-full h-full flex items-center justify-center pointer-events-auto">
                                {editingEdgeIndex === i ? (
                                    <div className="bg-white border-2 border-indigo-500 rounded-md p-0.5 flex gap-1 shadow-xl">
                                        <input 
                                            autoFocus 
                                            className="text-[10px] font-bold outline-none px-1 w-20" 
                                            value={edgeLabelInput} 
                                            onChange={(e) => setEdgeLabelInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdgeLabel()}
                                            onBlur={saveEdgeLabel}
                                        />
                                        <button onClick={saveEdgeLabel} className="bg-indigo-600 text-white p-0.5 rounded"><Check size={10}/></button>
                                    </div>
                                ) : (
                                    <div className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-tight cursor-text select-none ${isSelected ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-400 border-slate-200 shadow-sm'}`}>
                                        {edge.label}
                                    </div>
                                )}
                            </div>
                        </foreignObject>
                    </g>
                    );
                })}

                {linkPreview && (
                    <path 
                        d={`M ${linkPreview.startX} ${linkPreview.startY} L ${linkPreview.currentX} ${linkPreview.currentY}`}
                        stroke="#6366f1" 
                        strokeWidth="2" 
                        strokeDasharray="4 4" 
                        fill="none" 
                        markerEnd="url(#arrowhead)"
                    />
                )}

                {standardNodes.map(node => {
                    const colors = getNodeColor(node.type);
                    const isTable = node.type === 'simple_table' || node.type === 'table' || classification === 'ER_DIAGRAM';
                    const shape = node.shape || (isTable ? 'rect' : (node.type === 'decision' ? 'rhombus' : (node.type === 'terminal' ? 'stadium' : (node.type === 'storage' ? 'cylinder' : 'rect'))));
                    const width = node.width || (isTable ? 300 : 180);
                    const headerHeight = 32;
                    const colHeight = 24;
                    const height = node.height || (isTable ? (headerHeight + (node.columns?.length || 1) * colHeight) : 64);
                    const isSelected = selectedNodeId === node.id;
                    const isEditing = editingNodeId === node.id;

                    return (
                    <g 
                      key={node.id} 
                      transform={`translate(${node.x}, ${node.y})`} 
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                        <g>
                            {(() => {
                                const strokeW = isSelected ? '3px' : '1.5px';
                                const strokeC = isSelected ? '#6366f1' : undefined;
                                switch(shape) {
                                    case 'rhombus':
                                        return <polygon points={`${width/2},0 ${width},${height/2} ${width/2},${height} 0,${height/2}`} className={`${colors.bg} ${colors.border}`} stroke={strokeC} strokeWidth={strokeW} />;
                                    case 'stadium':
                                        return <rect width={width} height={height} rx={height/2} className={`${colors.bg} ${colors.border}`} stroke={strokeC} strokeWidth={strokeW} />;
                                    case 'cylinder':
                                        return (
                                            <g>
                                                <ellipse cx={width/2} cy={12} rx={width/2} ry={12} className={`${colors.bg} ${colors.border}`} stroke={strokeC} strokeWidth={strokeW} />
                                                <rect y={12} width={width} height={height-24} className={`${colors.bg} ${colors.border} border-y-0`} stroke={strokeC} strokeWidth={strokeW} />
                                                <ellipse cx={width/2} cy={height-12} rx={width/2} ry={12} className={`${colors.bg} ${colors.border}`} stroke={strokeC} strokeWidth={strokeW} />
                                            </g>
                                        );
                                    default:
                                        return <rect width={width} height={height} rx={isTable ? 4 : 8} className={`${colors.bg} ${colors.border}`} stroke={strokeC} strokeWidth={strokeW} />;
                                }
                            })()}
                        </g>
                        
                        {isTable && (
                            <g>
                                <rect width={width} height={headerHeight} rx="4" className={`${colors.header} stroke-none`} />
                                <line x1="0" y1={headerHeight} x2={width} y2={headerHeight} className={`${colors.border} stroke-[1px]`} />
                                {node.columns?.map((col, idx) => (
                                    <g key={idx} transform={`translate(0, ${headerHeight + idx * colHeight})`}>
                                        <rect width={width} height={colHeight} className={`${idx % 2 === 0 ? 'fill-transparent' : 'fill-slate-50/50'} stroke-none`} />
                                        <text x="12" y="16" className="fill-slate-400 text-[8px] font-mono">{col.type}</text>
                                        <text x="75" y="16" className="fill-slate-700 text-[10px] font-bold">{col.name}</text>
                                        <g transform={`translate(${width - 50}, 0)`}>
                                            {col.isPk && <text x="0" y="16" className="fill-rose-600 font-bold text-[8px]">PK</text>}
                                            {col.isFk && <text x={col.isPk ? 18 : 0} y="16" className="fill-indigo-600 font-bold text-[8px]">FK</text>}
                                        </g>
                                    </g>
                                ))}
                            </g>
                        )}

                        {isEditing ? (
                            <foreignObject x={isTable ? 12 : 0} y={isTable ? 4 : height / 2 - 10} width={width - (isTable ? 24 : 0)} height="30">
                                <div className="w-full h-full flex items-center justify-center">
                                    <input 
                                        autoFocus 
                                        className="w-full text-[10px] font-bold outline-none px-2 py-1 border-2 border-indigo-500 rounded bg-white shadow-xl text-center" 
                                        value={nodeLabelInput} 
                                        onChange={(e) => setNodeLabelInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveNodeLabel()}
                                        onBlur={saveNodeLabel}
                                    />
                                </div>
                            </foreignObject>
                        ) : (
                            <text 
                                x={width/2} 
                                y={isTable ? 20 : height/2 + 4} 
                                className={`${colors.text} font-bold text-[10px] tracking-wide pointer-events-none uppercase`} 
                                textAnchor="middle"
                                onDoubleClick={() => handleNodeDoubleClick(node.id, node.label)}
                            >
                                {node.label}
                            </text>
                        )}

                        {/* Anchors - visible on hover or selection */}
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {getAnchors(node).map(a => (
                                <circle key={a.id} cx={a.x - node.x} cy={a.y - node.y} r="5" className="fill-white stroke-indigo-500 stroke-2 hover:fill-indigo-500 transition-colors" />
                            ))}
                        </g>
                    </g>
                    );
                })}
            </g>
          </svg>
      )}

      {/* Custom Tooltip Overlay */}
      {hoveredNode && !draggedNodeId && !isPanning && (
        <div 
            className="fixed z-[100] pointer-events-none bg-slate-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-2xl border border-slate-700 max-w-xs animate-fade-in ring-1 ring-white/10"
            style={{ 
                left: mousePos.x + 15, 
                top: mousePos.y + 15 
            }}
        >
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
                <div className={`p-1.5 rounded-lg bg-white/10 ${getNodeColor(hoveredNode.type).text.replace('fill-', 'text-')}`}>
                    <Info size={12} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{hoveredNode.type}</div>
            </div>
            <div className="font-bold text-sm mb-1 leading-tight tracking-tight">{hoveredNode.label}</div>
            {hoveredNode.description && (
                <div className="text-[11px] text-slate-400 leading-relaxed italic mt-1 font-medium">
                    {hoveredNode.description}
                </div>
            )}
            {!hoveredNode.description && (
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mt-1">
                    System Component ID: {hoveredNode.id.substring(0, 8)}
                </div>
            )}
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
         <div className="flex flex-col bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
            <button onClick={() => setIsCodeView(!isCodeView)} className={`p-2 rounded-md transition-all ${isCodeView ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`} title={isCodeView ? "Visual View" : "Code View"}>
                {isCodeView ? <Eye size={16}/> : <Code size={16}/>}
            </button>
         </div>

         {!isCodeView && (
             <>
                 <div className="flex flex-col bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
                    <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-md" title="Zoom In"><ZoomIn size={16}/></button>
                    <button onClick={() => setZoom(z => Math.max(0.1, z - 0.2))} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-md" title="Zoom Out"><ZoomOut size={16}/></button>
                    <div className="h-px bg-slate-100 mx-1.5 my-1"></div>
                    <button onClick={handleAutoFit} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md flex flex-col items-center gap-1 group/btn" title="Auto-Adjust View"><Focus size={16}/><span className="text-[7px] font-black uppercase hidden group-hover/btn:block">Auto</span></button>
                 </div>
                 
                 {(selectedNodeId || selectedEdgeIndex !== null) && (
                    <div className="bg-white border border-slate-200 p-1 rounded-lg shadow-sm animate-fade-in">
                        <button 
                            onClick={() => {
                                if (selectedNodeId && onDesignChange) {
                                    onDesignChange({ nodes: nodes.filter(n => n.id !== selectedNodeId), edges: edges.filter(e => e.from !== selectedNodeId && e.to !== selectedNodeId) });
                                    setInternalSelectedNodeId(null);
                                    onSelectNode?.(null);
                                } else if (selectedEdgeIndex !== null && onDesignChange) {
                                    onDesignChange({ nodes, edges: edges.filter((_, i) => i !== selectedEdgeIndex) });
                                    setSelectedEdgeIndex(null);
                                    setEditingEdgeIndex(null);
                                }
                            }} 
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-md"
                        >
                            <Trash2 size={16}/>
                        </button>
                    </div>
                 )}
             </>
         )}
      </div>
    </div>
  );
});

export default ArchitectureCanvas;
