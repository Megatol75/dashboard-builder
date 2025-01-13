import { useState, useEffect, useRef, useCallback } from 'react'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Node,
  Connection,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  addEdge,
  ConnectionMode,
  DefaultEdgeOptions,
  MarkerType,
  SelectionMode,
  Edge,
  EdgeChange,
  NodeChange,
  applyNodeChanges
} from 'reactflow'
import 'reactflow/dist/style.css'
import '../App.css'
import { Sidebar } from './sidebar'
import { FlowPropertiesPanel } from './properties-panel'
import { FlowContent } from './sidebar-flow-content'
import { HtmlNode } from './nodes/html-node'
import { EquipmentNode } from './nodes/equipment-node'
import { ChartNode } from './nodes/chart-node'

const defaultChartData = {
  pieChart: [
    { name: 'A', value: 400, color: '#0088FE' },
    { name: 'B', value: 300, color: '#00C49F' },
    { name: 'C', value: 300, color: '#FFBB28' },
    { name: 'D', value: 200, color: '#FF8042' }
  ],
  lineChart: [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 400 },
    { name: 'May', value: 500 }
  ],
  barChart: [
    { name: 'A', value: 400, color: '#0088FE' },
    { name: 'B', value: 300, color: '#00C49F' },
    { name: 'C', value: 300, color: '#FFBB28' },
    { name: 'D', value: 200, color: '#FF8042' }
  ]
}

// Define custom node types
const nodeTypes = {
  button: HtmlNode,
  input: HtmlNode,
  label: HtmlNode,
  oilJack: EquipmentNode,
  pump: EquipmentNode,
  tank: EquipmentNode,
  pieChart: ChartNode,
  lineChart: ChartNode,
  barChart: ChartNode
}

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 8,
    height: 8,
    color: 'green'
  },
  style: { 
    strokeWidth: 10, 
    stroke: 'green',
    transition: 'stroke 300ms ease'
  }
}

// Define different edge styles for chart connections
const chartEdgeStyle = {
  type: 'straight',
  animated: false,
  style: { 
    strokeWidth: 1,
    stroke: '#999',
    strokeDasharray: '4 4'
  }
}

const edgeStyles = {
  selected: {
    strokeWidth: 10,
    stroke: '#ff9100'
  },
  default: {
    strokeWidth: 10,
    stroke: 'green'
  },
  hover: {
    strokeWidth: 10,
    stroke: '#2563eb'
  }
}

export function FlowDashboard() {
  // Flow state
  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])
  const [blockCount, setBlockCount] = useState(1)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  // Properties panel state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(256)
  const [isResizing, setIsResizing] = useState(false)
  const [isPanelVisible, setIsPanelVisible] = useState(true)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Handle properties panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX
        setPropertiesPanelWidth(Math.max(200, Math.min(600, newWidth)))
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Handle node selection
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }

  // Handle edge updates
  const onConnect = useCallback((params: Connection) => {
    // Find the source and target nodes
    const sourceNode = nodes.find(node => node.id === params.source)
    const targetNode = nodes.find(node => node.id === params.target)
    
    // Check if either node is a chart type
    const isChartConnection = ['pieChart', 'lineChart', 'barChart'].includes(sourceNode?.type || '') || 
                             ['pieChart', 'lineChart', 'barChart'].includes(targetNode?.type || '')

    setEdges(edges => addEdge({
      ...params,
      ...(isChartConnection ? chartEdgeStyle : defaultEdgeOptions)
    }, edges))
  }, [nodes, setEdges])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowInstance) return

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const isChart = type === 'pieChart' || type === 'lineChart' || type === 'barChart'
      const newNode: Node = {
        id: `node-${blockCount}`,
        type,
        position,
        data: { 
          label: `${type} ${blockCount}`,
          type,
          ...(isChart && { data: defaultChartData[type as keyof typeof defaultChartData] })
        },
        style: isChart ? { width: 300, height: 300 } : undefined
      }

      setNodes(nodes => [...nodes, newNode])
      setBlockCount(prev => prev + 1)
    },
    [reactFlowInstance, blockCount, setNodes]
  )

  // Add a new node to the flow
  const addNewNode = (type: string) => {
    const isEquipment = type.startsWith('oil') || type === 'pump' || type === 'tank'
    const isChart = type === 'pieChart' || type === 'lineChart' || type === 'barChart'
    const newNode: Node = {
      id: `node-${blockCount}`,
      type: type,
      position: { x: 100, y: 100 * blockCount },
      data: { 
        label: `${type} ${blockCount}`,
        type: type,
        ...(isChart && { data: defaultChartData[type as keyof typeof defaultChartData] })
      },
      style: isChart ? { width: 300, height: 300 } : isEquipment ? { width: 50, height: 50 } : undefined
    }

    setNodes(nodes => [...nodes, newNode])
    setBlockCount(blockCount + 1)
  }

  // Handle node updates from properties panel
  const handleUpdateNode = (nodeId: string, updates: Partial<Node['data']>) => {
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId 
        ? { 
            ...node,
            data: updates
          }
        : node
    ))
    // Update selected node to reflect changes immediately
    setSelectedNode(prev => 
      prev?.id === nodeId 
        ? { ...prev, data: updates }
        : prev
    )
  }

  // Handle edge updates
  const onEdgeMouseEnter = (_: React.MouseEvent, edge: Edge) => {
    if (!edge.selected) {
      setEdges(edges => 
        edges.map(e => {
          if (e.id === edge.id) {
            return {
              ...e,
              style: edgeStyles.hover,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 8,
                height: 8,
                color: '#2563eb'
              }
            }
          }
          return e
        })
      )
    }
  }

  const onEdgeMouseLeave = (_: React.MouseEvent, edge: Edge) => {
    if (!edge.selected) {
      setEdges(edges => 
        edges.map(e => {
          if (e.id === edge.id) {
            return {
              ...e,
              style: edgeStyles.default,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 8,
                height: 8,
                color: 'green'
              }
            }
          }
          return e
        })
      )
    }
  }

  // Update edge styles when selection changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => {
      // First apply all non-select changes (like removal)
      let nextEdges = [...eds]
      
      changes.forEach(change => {
        if (change.type === 'remove') {
          nextEdges = nextEdges.filter(e => e.id !== change.id)
        }
      })

      // Then handle selection changes and update styles
      changes.forEach(change => {
        if (change.type === 'select' && 'selected' in change) {
          nextEdges = nextEdges.map(edge => {
            if (edge.id === change.id) {
              return {
                ...edge,
                selected: change.selected,
                style: change.selected ? edgeStyles.selected : edgeStyles.default,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 8,
                  height: 8,
                  color: change.selected ? '#ff9100' : 'green'
                }
              }
            }
            return edge
          })
        }
      })

      return nextEdges
    })
  }, [setEdges])

  // Handle keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        setNodes(nodes => {
          const remainingNodes = nodes.filter(node => !node.selected)
          // Clear selected node if it was deleted
          if (selectedNode && !remainingNodes.find(n => n.id === selectedNode.id)) {
            setSelectedNode(null)
          }
          return remainingNodes
        })
        setEdges(edges => edges.filter(edge => !edge.selected))
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [setNodes, setEdges, selectedNode])

  // Handle node changes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const nextNodes = applyNodeChanges(changes, nds)
      // Check if selected node was removed
      if (selectedNode && changes.some(change => 
        change.type === 'remove' && change.id === selectedNode.id
      )) {
        setSelectedNode(null)
      }
      return nextNodes
    })
  }, [selectedNode, setNodes])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar title="Flow Dashboard" isPanelVisible={isPanelVisible} onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}>
        <FlowContent onAddNode={addNewNode} />
      </Sidebar>

      <div ref={reactFlowWrapper} className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          connectionMode={ConnectionMode.Loose}
          selectionMode={SelectionMode.Partial}
          onEdgeMouseEnter={onEdgeMouseEnter}
          onEdgeMouseLeave={onEdgeMouseLeave}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </div>

      {isPanelVisible && selectedNode && (
        <>
          <div
            className="w-1 h-full cursor-col-resize bg-border hover:bg-primary/50"
            onMouseDown={() => setIsResizing(true)}
          />
          <FlowPropertiesPanel
            width={propertiesPanelWidth}
            selectedNode={selectedNode}
            onResize={() => setIsResizing(true)}
            onUpdateNode={handleUpdateNode}
          />
        </>
      )}
    </div>
  )
} 