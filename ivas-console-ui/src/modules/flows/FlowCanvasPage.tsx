import "reactflow/dist/style.css";
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Spinner,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiArrowLeft, FiPlay, FiSave, FiTerminal } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import { flowApi } from "@/core/api/services";
import { DebugTerminalPanel } from "@/shared/components/DebugTerminalPanel";
import { useWorkspaceParams } from "@/shared/hooks/useWorkspaceParams";
import { WidgetNode, type WidgetNodeData } from "./WidgetNode";
import { WidgetPalette } from "./WidgetPalette";
import { widgetByType } from "./widgets";
import type { FlowNodeType, TrainStatus } from "@/core/types/dto";

const statusColor: Record<TrainStatus, string> = {
  draft: "gray",
  queued: "yellow",
  training: "orange",
  ready: "green",
  failed: "red",
};

let nodeSeq = 1;

function FlowCanvasInner() {
  const { flowId = "" } = useParams();
  const { orgId, workspaceId } = useWorkspaceParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const debug = useDisclosure();

  const [nodes, setNodes, onNodesChange] = useNodesState<WidgetNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({ widget: WidgetNode }), []);

  const flow = useQuery({
    queryKey: ["flow", flowId],
    queryFn: () => flowApi.get(flowId),
  });

  const logs = useQuery({
    queryKey: ["flow-logs", flowId],
    queryFn: () => flowApi.logs(flowId),
    refetchInterval: debug.isOpen ? 1500 : false,
  });

  // Hydrate canvas from loaded flow.
  useEffect(() => {
    if (!flow.data) return;
    setNodes(
      flow.data.graph.nodes.map((n) => ({
        id: n.id,
        type: "widget",
        position: n.position,
        data: { label: n.data.label, widgetType: n.type },
      })),
    );
    setEdges(
      flow.data.graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
      })),
    );
  }, [flow.data, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData(
        "application/reactflow",
      ) as FlowNodeType;
      if (!type || !wrapperRef.current) return;
      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      const widget = widgetByType(type);
      const newNode: Node<WidgetNodeData> = {
        id: `n_${Date.now()}_${nodeSeq++}`,
        type: "widget",
        position,
        data: { label: widget.label, widgetType: type },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  const updateSelectedLabel = (label: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedId ? { ...n, data: { ...n.data, label } } : n,
      ),
    );
  };

  const save = useMutation({
    mutationFn: () =>
      flowApi.update(flowId, {
        graph: {
          nodes: nodes.map((n) => ({
            id: n.id,
            type: n.data.widgetType,
            position: n.position,
            data: { label: n.data.label },
          })),
          edges: (edges as Edge[]).map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: typeof e.label === "string" ? e.label : undefined,
          })),
        },
      }),
    onSuccess: () => {
      toast({ title: "Flow saved", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["flow", flowId] });
    },
  });

  const train = useMutation({
    mutationFn: () => flowApi.train(flowId),
    onSuccess: () => {
      toast({ title: "Flow trained", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["flow", flowId] });
      queryClient.invalidateQueries({ queryKey: ["flow-logs", flowId] });
    },
  });

  const miniMapBg = useColorModeValue("#f7fafc", "#1a202c");

  if (flow.isLoading) {
    return (
      <Box p={8}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Flex direction="column" h="full">
      {/* Toolbar */}
      <Flex
        align="center"
        px={4}
        py={2}
        borderBottomWidth="1px"
        borderColor="app.border"
        bg="app.surface"
        gap={3}
      >
        <IconButton
          aria-label="Back"
          icon={<FiArrowLeft />}
          size="sm"
          variant="ghost"
          onClick={() =>
            navigate(`/orgs/${orgId}/workspaces/${workspaceId}/flows`)
          }
        />
        <Text fontWeight="semibold">{flow.data?.name}</Text>
        {flow.data && (
          <Badge colorScheme={statusColor[flow.data.trainStatus]}>
            {flow.data.trainStatus}
          </Badge>
        )}
        <Box flex="1" />
        <HStack>
          <Button
            size="sm"
            leftIcon={<FiTerminal />}
            variant="outline"
            onClick={debug.onToggle}
          >
            Debug
          </Button>
          <Button
            size="sm"
            leftIcon={<FiSave />}
            onClick={() => save.mutate()}
            isLoading={save.isPending}
          >
            Save
          </Button>
          <Button
            size="sm"
            leftIcon={<FiPlay />}
            colorScheme="green"
            onClick={() => train.mutate()}
            isLoading={train.isPending}
          >
            Train
          </Button>
        </HStack>
      </Flex>

      {/* Body: palette + canvas */}
      <Flex flex="1" overflow="hidden">
        <WidgetPalette />
        <Box flex="1" ref={wrapperRef} position="relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
            <MiniMap style={{ background: miniMapBg }} pannable zoomable />
          </ReactFlow>

          {debug.isOpen && (
            <Box
              position="absolute"
              bottom={3}
              left={3}
              right={3}
              zIndex={5}
            >
              <DebugTerminalPanel
                logs={logs.data ?? []}
                title={`flow: ${flow.data?.name}`}
                height={160}
              />
            </Box>
          )}
        </Box>
      </Flex>

      {/* Node config drawer */}
      <Drawer
        isOpen={!!selectedNode}
        placement="right"
        onClose={() => setSelectedId(null)}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent bg="app.surface">
          <DrawerCloseButton />
          <DrawerHeader>
            {selectedNode
              ? widgetByType(selectedNode.data.widgetType).label
              : "Node"}{" "}
            settings
          </DrawerHeader>
          <DrawerBody>
            {selectedNode && (
              <>
                <FormControl mb={4}>
                  <FormLabel>Label</FormLabel>
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => updateSelectedLabel(e.target.value)}
                  />
                </FormControl>
                {selectedNode.data.widgetType === "callApi" && (
                  <FormControl mb={4}>
                    <FormLabel>Response format</FormLabel>
                    <Select defaultValue="text">
                      <option value="text">Text</option>
                      <option value="json">JSON</option>
                    </Select>
                  </FormControl>
                )}
                {selectedNode.data.widgetType === "message" && (
                  <FormControl mb={4}>
                    <FormLabel>Message text</FormLabel>
                    <Textarea placeholder="Type the bot response..." />
                  </FormControl>
                )}
                <Text fontSize="xs" color="app.textMuted">
                  Node id: {selectedNode.id}
                </Text>
              </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}

export function FlowCanvasPage() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
