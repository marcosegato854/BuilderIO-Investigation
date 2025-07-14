import { AlignmentDialog, AlignmentPhase } from 'store/features/alignment/types'
import { PlanningTools } from 'store/features/planning/types'
import {
  MapNavigationMode,
  MapPanningMode,
  ViewMode,
} from 'store/features/position/types'
import {
  HeremapsActionType,
  HeremapsDirection,
  HeremapsSeverity,
} from 'store/features/routing/types'
import {
  MapsCountry,
  NotificationsPosition,
  SystemNotificationType,
} from 'store/features/system/types'
import { mockAutcapturePolygons } from 'store/mock/mockAutocapturePolygons'
import { mockCameraGroups } from 'store/mock/mockCameras'
import { mockPolygonGeometry } from 'store/mock/mockPolygonGeometry'
import { mockTrackGeometry } from 'store/mock/mockTrackGeometry'
import { MapMode, MapView } from 'utils/myVR/types'

export const mockStore = {
  authService: {
    isAuthenticating: false,
    token: null,
    userInfo: null,
  },
  theme: {
    theme: 'dark',
  },
  router: {
    location: {
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
      query: {},
    },
    action: 'POP',
  },
  system: {
    modules: [
      'system',
      'user',
      'datastorage',
      'position',
      'camera',
      'scanner',
      'notification',
      'pointcloud',
      'imageAI',
      'planning',
      'routing',
    ],
    systemState: null,
    info: {
      serial: '57023',
      softwareversion: '2020.1.1.4',
      systemtype: 'Pegasus:TRK 700 Optech',
      language: 'English',
      maps: {
        country: MapsCountry.INTERNATIONAL,
        appId: '',
        appCode: '',
        appKey: 's7P76OCmpNW2B9yTVscGjXk9sEnpqCcZ9LyUOxG2dcU',
      },
      softwareBuildType: 'Develop',
      windowsBuild: '9',
      countryCode: 'en',
    },
    notificationsSocketConnected: false,
    stateSocketConnected: false,
    notifications: [
      {
        id: 22,
        code: 'SCN-005',
        description: '___ {p1}',
        type: SystemNotificationType.ERROR,
        p1: 'ScannerModel',
      },
      {
        id: 0,
        type: SystemNotificationType.ERROR,
        description: 'Camera went off',
        code: '000',
      },
      {
        id: 1,
        type: SystemNotificationType.ERROR,
        description: 'Battery is very low',
        code: '001',
      },
      {
        id: 2,
        type: SystemNotificationType.WARNING,
        description: 'Driving speed is too fast',
        code: '002',
      },
      {
        id: 3,
        type: SystemNotificationType.ERROR,
        description: 'Error loading file',
        code: '003',
      },
      {
        id: 4,
        type: SystemNotificationType.WARNING,
        description: 'Driving too slow',
        code: '004',
      },
      {
        id: 5,
        type: SystemNotificationType.ERROR,
        description: 'DMI missing',
        code: '005',
      },
      {
        id: 6,
        type: SystemNotificationType.WARNING,
        description: 'Driving too slow',
        code: '006',
      },
      {
        id: 7,
        type: SystemNotificationType.ERROR,
        description: 'DMI missing very long message here',
        code: '007',
      },
      {
        id: 2,
        type: SystemNotificationType.REMOVE,
        description: 'Driving speed is too fast (remove)',
        code: '002',
      },
    ],
    realTimeNotifications: [
      {
        id: 2,
        code: 'E1',
        description: 'Error1RT',
        type: 2,
      },
      {
        id: 3,
        code: 'W1',
        description: 'Warning1RT',
        type: 1,
      },
    ],
    position: 'center' as NotificationsPosition,
    responsiveness: {
      system: {
        health: 38,
        critical: false,
        details: {
          cpu: { label: 'CPU load', health: 28, critical: false },
          gpu: { label: 'GPU load', health: 13, critical: false },
          ram: { label: 'RAM load', health: 72, critical: false },
        },
      },
      connection: {
        health: 4,
        critical: false,
        internet: { label: 'Internet', health: 3, critical: false },
        gateway: { label: 'Gateway', health: 4, critical: false },
        client: {
          // this node will be populated by the frontend
          label: 'Client',
          health: 4,
          critical: false,
        },
      },
      battery: {
        health: 100,
        minutes: 61,
        charging: false,
        critical: false,
        details: {
          batteries: [
            {
              id: 1,
              name: 'battery 1',
              description: '100m left',
              minutes: 100,
              health: 100,
              charging: false,
              critical: false,
            },
            {
              id: 2,
              name: 'battery 2',
              description: '13m left',
              minutes: 13,
              health: 18,
              charging: false,
              critical: true,
              active: true,
            },
          ],
        },
      },
      storage: {
        health: 72.5,
        total: 4000,
        available: 2900,
        critical: false,
        details: {
          disks: [
            {
              id: 1,
              name: 'p',
              health: 50,
              total: 2000,
              available: 1000,
              critical: false,
              slot: 0,
            },
            {
              id: 2,
              name: 'HD 2',
              health: 100,
              total: 2000,
              available: 1900,
              critical: false,
            },
          ],
        },
      },
      usersConnected: 1,
    },
    initializationHidden: true,
    releaseTag: 'Test',
  },
  scanner: {
    supportedSettings: {
      current: 'zf',
      settings: [
        // fake values for testing purpouse
        { rps: 53, pts: 547000, mr: 182 },
        { rps: 107, pts: 547000, mr: 182 },
        { rps: 134, pts: 547000, mr: 182 },
        { rps: 160, pts: 547000, mr: 182 },
        { rps: 267, pts: 547000, mr: 182 },
        { rps: 53, pts: 1094000, mr: 182 },
        { rps: 107, pts: 1094000, mr: 212 },
        { rps: 134, pts: 1094000, mr: 212 },
        { rps: 160, pts: 1094000, mr: 212 },
        { rps: 214, pts: 1094000, mr: 212 },
        { rps: 267, pts: 1094000, mr: 212 },
      ],
    },
    info: [
      {
        manufacturer: 'Velodyne',
        name: 'FrontSLAM',
        position: 'Front',
        model: '',
        serial: '',
        firmware: '',
      },
      {
        manufacturer: 'Velodyne',
        name: 'RearSLAM',
        position: 'Rear',
        model: '',
        serial: '',
        firmware: '',
      },
    ],
  },
  dataStorageService: {
    info: null,
    config: null,
    processing: [
      {
        disk: 'p',
        project: 'Project002',
        job: 'Job001',
        isImageAI: true,
        progress: 66,
        options: {
          export: {
            lgs: {
              enable: true,
              done: false,
            },
            lgsx: {
              enable: false,
              done: false,
            },
            e57: {
              enable: false,
              done: false,
            },
          },
          finalise: {
            blur: {
              enable: true,
              done: false,
            },
            colorization: {
              enable: false,
              done: false,
            },
          },
        },
      },
      {
        disk: 'p',
        project: 'Project003',
        job: 'Job001',
        isImageAI: false,
        progress: 33,
        options: {
          export: {
            lgs: {
              enable: true,
              done: false,
            },
            lgsx: {
              enable: false,
              done: false,
            },
            e57: {
              enable: false,
              done: false,
            },
          },
          finalise: {
            blur: {
              enable: true,
              done: true,
            },
            colorization: {
              enable: false,
              done: false,
            },
          },
        },
      },
    ],
    disks: [
      {
        name: 'p',
        total: 200,
        available: 20,
        health: 2,
        removable: true,
        critical: true,
        default: false,
        slot: 0,
      },
      {
        name: 'DiskName',
        total: 200,
        available: 150,
        health: 10,
        removable: true,
        critical: false,
        default: true,
      },
    ],
    jobTypes: [
      {
        name: 'Road',
        profile: 0,
        ntrip: {
          enable: false,
          name: '',
          server: '',
          user: '',
          password: '',
          mountpoint: '',
          interfacemode: '',
        },
        dmi: {
          type: 'none',
          leverarm: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        },
        collectionmode: 'oneway',
        camera: {
          enable: 1,
          distance: 3.0,
          elapse: 250,
          left: {
            orientation: 'landscape',
          },
          right: {
            orientation: 'landscape',
          },
        },
        antenna: {
          type: 'single',
          leverarm: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        },
        drivingspeed: 45.0,
        scanner: {
          scanlinespacing: 5.0,
        },
        position: {
          accuracy: {
            low: 0.05,
            high: 0.1,
          },
          satellites: ['gps', 'glonass', 'galileo', 'beidou', 'qzss'],
        },
      },
      {
        name: 'Rail',
        profile: 1,
        ntrip: {
          enable: false,
          name: '',
          server: '',
          user: '',
          password: '',
          mountpoint: '',
          interfacemode: '',
        },
        dmi: {
          type: 'optical',
          leverarm: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        },
        collectionmode: 'oneway',
        camera: {
          enable: 1,
          distance: 3.0,
          elapse: 250,
          left: {
            orientation: 'landscape',
          },
          right: {
            orientation: 'landscape',
          },
        },
        antenna: {
          type: 'double',
          leverarm: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        },
        drivingspeed: 45.0,
        scanner: {
          scanlinespacing: 5.0,
        },
        position: {
          accuracy: {
            low: 0.05,
            high: 0.1,
          },
          satellites: ['gps', 'glonass', 'galileo', 'beidou', 'qzss'],
        },
      },
      {
        name: 'Boat',
        profile: 2,
        ntrip: {
          enable: false,
          name: '',
          server: '',
          user: '',
          password: '',
          mountpoint: '',
          interfacemode: '',
        },
        dmi: {
          type: 'none',
          leverarm: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        },
        collectionmode: 'oneway',
        camera: {
          enable: 1,
          distance: 3.0,
          elapse: 250,
          left: {
            orientation: 'landscape',
          },
          right: {
            orientation: 'landscape',
          },
        },
        antenna: {
          type: 'double',
          leverarm: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        },
        drivingspeed: 18.0,
        scanner: {
          scanlinespacing: 10.0,
        },
        position: {
          accuracy: {
            low: 0.05,
            high: 0.1,
          },
          satellites: ['gps', 'glonass', 'galileo', 'beidou', 'qzss'],
        },
      },
      {
        name: 'MyCustom',
        profile: 0,
        ntrip: {
          enable: false,
        },
        dmi: {
          type: 'none',
          leverarm: {},
        },
        collectionmode: 'oneway',
        camera: {
          enable: 1,
          distance: 7.0,
          elapse: 250,
          left: {
            orientation: 'landscape',
          },
          right: {
            orientation: 'landscape',
          },
        },
        antenna: {
          leverarm: {},
        },
        drivingspeed: 54.0,
        scanner: {
          scanlinespacing: 10.0,
          rotationspeed: 250,
          pointspersecond: 500000,
          range: 155,
        },
        position: {
          accuracy: {
            low: 0.05,
            high: 0.1,
          },
          satellites: ['gps', 'glonass', 'galileo', 'beidou', 'qzss'],
        },
      },
    ],
    projects: [
      {
        name: 'Project001',
        disk: 'd',
        jobs: 5,
        completed: 5,
        coordinate: {
          unit: 'metric',
          name: '',
          unitscale: 1,
        },
        creationdate: '2021-09-15T13:01:43Z',
        image: '',
        controlpoints: 5,
        size: 1953,
        updatedate: '2021-09-15T13:01:43Z',
        warnings: ['DS-038'],
      },
      {
        name: 'Project002',
        disk: 'p',
        jobs: 5,
        completed: 5,
        coordinate: {
          unit: 'metric',
          name: '',
          unitscale: 1,
        },
        creationdate: '2021-09-15T13:01:43Z',
        image: '',
        controlpoints: 5,
        size: 1953,
        updatedate: '2021-09-15T13:01:43Z',
        warnings: ['DS-038', 'NOT_LEICA_HD'],
      },
    ],
    currentProject: {
      name: 'Project002',
      disk: 'p',
      jobs: 5,
      completed: 5,
      coordinate: {
        unit: 'metric',
        automatic: true,
        name: '',
        unitscale: 1,
      },
      creationdate: '2021-09-15T13:01:43Z',
      image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAE',
      controlpoints: 5,
      size: 1953,
      updatedate: '2021-09-15T13:01:43Z',
      warnings: ['DS-038', 'NOT_LEICA_HD'],
      jobsAcquired: 3,
    },
    projectGridSettings: {},
    jobs: [
      {
        name: 'Job001',
        scans: 0,
        image: '',
        planned: true,
        type: 'Road',
        dmi: {
          type: 'optical',
          leverarm: {
            x: 1,
            y: 1,
            z: 1,
          },
        },
        ntrip: {
          enable: true,
          name: 'servername',
          server: '121.1.1.20',
          user: 'username',
          password: 'pwd',
          mountpoint: 'mp',
          interfacemode: 'im',
        },
        collectionmode: 'oneway',
        camera: {
          enable: 1,
          distance: 3,
          elapse: 250,
          left: {
            orientation: 'landscape',
          },
          right: {
            orientation: 'landscape',
          },
        },
        antenna: {
          type: 'single',
          leverarm: {
            x: 1,
            y: 1,
            z: 1,
          },
        },
        drivingspeed: 30,
        scanner: {
          scanlinespacing: 2,
          rotationspeed: 500000,
          pointspersecond: 250,
          range: 155,
        },
        position: {
          satellites: ['gps', 'glonass'],
          accuracy: {
            high: 8,
            low: 8,
          },
        },
        size: 50,
        processed: 50,
        completed: 50,
        acquired: true,
        profile: 1,
        creationdate: '2021-09-15T13:01:43Z',
        updatedate: '2021-09-15T13:01:43Z',
      },
      {
        name: 'Job002',
        scans: 0,
        image: '',
        planned: true,
        type: 'Road',
        dmi: {
          type: 'optical',
          leverarm: {
            x: 1,
            y: 1,
            z: 1,
          },
        },
        ntrip: {
          enable: true,
          name: 'servername',
          server: '121.1.1.20',
          user: 'username',
          password: 'pwd',
          mountpoint: 'mp',
          interfacemode: 'im',
        },
        collectionmode: 'oneway',
        camera: {
          enable: 1,
          distance: 3,
          elapse: 250,
          left: {
            orientation: 'landscape',
          },
          right: {
            orientation: 'landscape',
          },
        },
        antenna: {
          type: 'single',
          leverarm: {
            x: 1,
            y: 1,
            z: 1,
          },
        },
        drivingspeed: 30,
        scanner: {
          scanlinespacing: 2,
          rotationspeed: 500000,
          pointspersecond: 250,
          range: 155,
        },
        position: {
          satellites: ['gps', 'glonass'],
          accuracy: {
            high: 8,
            low: 8,
          },
        },
        size: 50,
        processed: 50,
        completed: 50,
        acquired: true,
        profile: 1,
        creationdate: '2021-09-15T13:01:43Z',
        updatedate: '2021-09-15T13:01:43Z',
      },
    ],
    currentJob: {
      name: 'Job001',
      scans: 0,
      image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAE',
      planned: true,
      type: 'Road',
      dmi: {
        type: 'none',
        leverarm: {
          x: 1,
          y: 1,
          z: 1,
        },
      },
      ntrip: {
        enable: true,
        name: 'servername',
        server: '121.1.1.20',
        user: 'username',
        password: 'pwd',
        mountpoint: 'mp',
        interfacemode: 'im',
      },
      collectionmode: 'oneway',
      camera: {
        enable: 1,
        distance: 3.0,
        elapse: 250,
        blur: true,
        frames: 50,
        left: {
          orientation: 'landscape',
        },
        right: {
          orientation: 'landscape',
        },
      },
      antenna: {
        type: 'single',
        leverarm: {
          x: 152,
          y: 27,
          z: 457,
        },
      },
      drivingspeed: 45,
      scanner: {
        scanlinespacing: 5,
        rotationspeed: 250,
        pointspersecond: 500000,
        range: 155,
      },
      position: {
        satellites: ['gps', 'glonass', 'galileo', 'beidou', 'qzss'],
        accuracy: {
          low: 0.05,
          high: 0.1,
        },
      },
      size: 50,
      imageProcessed: 100,
      processed: 50,
      completed: 50,
      acquired: false,
      profile: 0,
      hardwareModel: 'PEGASUS TRK500 NEO',
      creationdate: '2021-09-15T13:01:43Z',
      updatedate: '2021-09-15T13:01:43Z',
      processingErrors: [
        {
          time: '2022-11-07T15:55:59',
          type: 2,
          code: 'PEO-GPC004',
          description:
            '(Job_202210031545->Track01) Impossible to open file <Job_202210031545_Scanner1000.lidar_lr32>',
        },
        {
          time: '2022-11-07T15:56:00',
          type: 2,
          code: 'PEO-PCJ005',
          description:
            'Error on executing process generate point cloud (Job_202210031545->Track01)',
        },
        {
          time: '2022-11-07T15:56:00',
          type: 1,
          code: 'PEO-GPC004',
          description:
            '(Job_202210031545->Track01) Impossible to open file <Job_202210031545_FrontSLAM000.lidar_lr32>',
        },
        {
          time: '2022-11-07T15:56:00',
          type: 1,
          code: 'PEO-PCJ005',
          description:
            'Error on executing process generate point cloud (Job_202210031545->Track01)',
        },
        {
          time: '2022-11-07T15:56:00',
          type: 2,
          code: 'PEO-GPC004',
          description:
            '(Job_202210031545->Track01) Impossible to open file <Job_202210031545_RearSLAM000.lidar_lr32>',
        },
        {
          time: '2022-11-07T15:56:00',
          type: 2,
          code: 'PEO-PCJ005',
          description:
            'Error on executing process generate point cloud (Job_202210031545->Track01)',
        },
        {
          time: '2022-11-07T15:56:01',
          type: 2,
          code: 'PEO-PCJ003',
          description: 'There are not containers',
        },
        {
          time: '2022-11-07T15:56:05',
          type: 0,
          code: 'PEO-LCB103',
          description: 'Default mask does not exist',
        },
      ],
    },
    jobGridSettings: {},
    tempJob: null,
  },
  actionsService: {
    activationProgress: 0,
    acquisitionReady: false,
    deactivating: false,
    recordingStatus: null,
    stopRecordingStatus: null,
    deactivationStatus: null,
    currentAction: null,
  },
  cameraService: {
    initialGroups: mockCameraGroups,
    groups: mockCameraGroups,
    exposure: {
      automatic: true,
      extendedExposure: '0.0',
    },
    trigger: {
      type: 'Distance',
      space: 2,
      time: 0,
    },
    antenna2: null,
  },
  positionService: {
    positionState: {
      position: {
        ins: {
          latitude: 45.89347452688184,
          longitude: 12.695247040046472,
          height: 62.15369679313153,
          displayheight: 17.15369679313153,
        },
        gps: {
          type: 'SINGLE',
          latitude: 45.89347362321073,
          longitude: 12.695247655474754,
          height: 61.89977655373514,
          displayheight: 16.899776553735138,
        },
        attitude: {
          pitch: 0,
          roll: 0,
          yaw: 0,
        },
      },
      satellites: {
        total: 27.0,
        GPS: 6.0,
        GLONASS: 3.0,
        BEIDOU: 4.0,
        GALILEO: 4.0,
      },
      status: {
        almanac: 'VALID',
        gps: 'SOL_COMPUTED',
        ins: 'INS_ALIGNMENT_COMPLETE',
        friendlystate: 0,
        friendlydescription: 'Inertial system without enough dynamics',
        possiblesolution:
          'Continue to move dinamically raising the speed and/or making more directions changes',
      },
      accuracy: {
        latitude: 2.3203141689300539,
        longitude: 2.503906726837158,
        height: 2.831125020980835,
        value: 4.499938063114486,
        class: 2,
      },
      rtkenabled: true,
      rtk: {
        rtkcorrectionreceived: true,
        rtkstatus: 'RTK fixed',
        internetconnected: true,
        ageofcorrections: 1,
        rtkserviceconnected: true,
      },
      gdop: 9999.0,
    },
    antenna2: { enabled: false },
    supportedSatellites: ['gps', 'glonass', 'galileo', 'beidou', 'qzss'],
    navigationMode: MapNavigationMode.NONE,
    panningMode: MapPanningMode.LOCKED,
    viewMode: ViewMode.CAMERA,
    pointcloudActive: true,
    planTracksVisible: true,
    cameraZoom: 0,
    positionSocketConnected: false,
    mapMode: MapMode.MAP_2D,
    mapView: MapView.THEME,
  },
  alignmentService: {
    alignmentState: {
      remaining: 20,
      isFailure: false,
      isComplete: false,
      description: 'Move on a straight line at least at the speed of 30km/h',
      messageCode: 'A2',
      dialog: AlignmentDialog.TIME_BASED_DYMANIC,
      alignmentPhase: AlignmentPhase.INITIAL,
    },
    alignmentSocketConnected: false,
  },
  routingService: {
    routingState: {
      action: HeremapsActionType.TURN,
      duration: 22,
      length: 76,
      instruction: 'Turn left onto Piazza Generale Armando Diaz. Go for 76 m.',
      offset: 1,
      direction: HeremapsDirection.LEFT,
      severity: HeremapsSeverity.QUITE,
      id: 1,
    },
    moduleEnabled: true,
    routingStatus: {
      enabled: true,
      initial: false,
      final: false,
    },
    autocaptureStatus: {
      enabled: true,
    },
    routingSocketConnected: false,
    autocaptureNeeded: {
      time: 500,
      disk: 40,
      battery: 70,
      distance: 80,
    },
    autocaptureCurrentPolygon: {
      name: 'Track001',
      isPolygon: false,
      color: '#7178fc',
      id: 10,
      ...mockTrackGeometry,
    },
    routingPolyline: null,
    autocapturePolygons: mockAutcapturePolygons,
    autocaptureNotifications: [],
    routingSpeechDirection: null,
    routingDirectionsEnabled: true,
  },
  planningService: {
    tool: PlanningTools.SELECT,
    undoablePolygons: {
      past: [],
      present: [
        {
          name: 'Track001',
          isPolygon: false,
          color: '#7178fc',
          id: 10,
          ...mockTrackGeometry,
        },
        {
          name: 'Polygon1',
          isPolygon: true,
          color: '#37e5b4',
          ...mockPolygonGeometry,
          id: 12,
        },
      ],
      future: [],
      group: null,
      index: 0,
      limit: 1,
    },
    initialAlignmentPoint: {
      latitude: 45.88344,
      longitude: 12.70837,
      freePoint: false,
    },
    finalAlignmentPoint: {
      latitude: 45.8821,
      longitude: 12.71297,
      freePoint: false,
    },
    needed: {
      time: 500,
      disk: 40,
      battery: 70,
      distance: 80,
    },
    scanner: null,
    sideCameras: null,
    creationDate: '2021-09-15T13:01:43Z',
    updateDate: '2021-09-15T13:01:43Z',
    edited: false,
    // optimize: true,
    warnings: [{ code: 'DS-039', description: 'Space not enough' }],
    currentPolygonId: -1,
    currentInternalPathId: -1,
    processingStatus: null,
    extractionStatus: null,
    importShpStatus: null,
    listShpStatus: null,
    rangeDisplay: true,
    mapMode: MapMode.MAP_2D,
    mapView: MapView.THEME,
    polygonNumber: 2,
    shpList: [
      {
        path: 'C:/asdf',
        filename: 'shape1.shp',
        lastEditDate: '2021-05-18T16:02:16Z',
      },
      {
        path: 'C:/asdf',
        filename: 'shape2.shp',
        lastEditDate: '2021-05-18T16:02:16Z',
      },
      {
        path: 'C:/longlongfolder/anotherfolder/even_longer/and_longer',
        filename: 'longlong_long_shape_name_why_not_but_more_than_this.shp',
        lastEditDate: '2021-05-18T16:02:16Z',
      },
      {
        path: 'C:/asdf',
        filename: 'shape4.shp',
        lastEditDate: '2021-05-18T16:02:16Z',
      },
      {
        path: 'C:/asdf',
        filename: 'hidden_shape.shp',
        lastEditDate: '2021-05-18T16:02:16Z',
      },
    ],
  },
  rtkService: {
    interfaceModes: ['MODE1', 'MODE2', 'MODE3'],
    mountpoints: [
      { name: 'Mountpoint 1', interfacemode: 'MODE1' },
      { name: 'Mountpoint 2', interfacemode: 'MODE2' },
      { name: 'Mountpoint 3', interfacemode: 'MODE3' },
      { name: 'Mountpoint 4', interfacemode: 'MODE1' },
    ],
    mountpointsActionProgress: 0,
    testActionProgress: 0,
    currentServer: {
      name: 'Test Server',
      password: 'mypassword',
      server: '127.0.0.1:8000',
      user: 'usernameCurrent',
      mountpoint: 'Mountpoint 2',
      interfacemode: 'MODE3',
      connected: true,
    },
    isAuthenticating: false,
    servers: [
      {
        name: 'Test Server',
        password: 'mypassword',
        server: '127.0.0.1:8000',
        user: 'username1',
        mountpoint: 'Mountpoint 2',
        interfacemode: 'MODE3',
        id: 1,
      },
      {
        name: 'Test Server2',
        password: 'mypassword',
        server: '128.0.0.2:8000',
        user: 'username2',
        mountpoint: 'Mountpoint 1',
        interfacemode: 'MODE2',
        connected: true,
        id: 2,
      },
    ],
    testInfo: {
      internetconnection: true,
      ntripconnection: true,
      agecorrection: '1',
      gdop: '77',
      hdop: '1.0420000000032154',
      position: {
        height: '0.02375642168476157',
        latitude: '0.0146548976541313',
        longitude: '0.0446548976541313',
      },
      precision2d: '0.01954687435123165',
      precisionheight: '0.026654654684135',
      satellites: {
        gps: 2,
        glonass: 5,
      },
      state: 'RTK Fixed',
      vdop: '1.15654564354687',
    },
    info: null,
    serverError: null,
  },
  pointCloudService: {
    connected: false,
    projection: null,
    proj4: null,
    notification: null,
    thickness: 2,
    bufferSettings: null,
    moduleEnabled: true,
  },
  dialogs: {
    dialogs: [],
  },
  errors: {
    errors: [],
  },
  speech: {
    queue: [],
    current: null,
    activated: true,
  },
  settings: {
    audio: {
      globalVolume: 75,
      audibleMessages: {
        COLLECTION: true,
        ERROR: false,
        NAVIGATION: false,
      },
    },
    lastPosition: {
      latitude: 47.50018,
      longitude: 9.62328,
    },
    planning: {
      scanner: null,
      sideCameras: null,
    },
    i18n: {
      language: 'en',
    },
    admin: {},
  },
  globalService: {
    log: [
      {
        type: 'log',
        args: ['msg content'],
      },
      {
        type: 'warn',
        args: ['msg content'],
      },
      {
        type: 'info',
        args: ['msg content'],
      },
      {
        type: 'error',
        args: ['msg content'],
      },
    ],
  },
  coordinateSystemService: {
    system: null,
    currentSystem: null,
    wkt: null,
    lastImported: null,
    systemImported: false,
    wktImported: false,
    fileList: [
      {
        path: 'C:/asdf',
        filename: 'coordinateSystem1',
        lastEditDate: '2021-05-18T16:02:16Z',
      },
      {
        path: 'C:/asdf',
        filename: 'coordinateSystem2',
        lastEditDate: '2021-05-18T16:02:16Z',
      },
      {
        path: 'C:/longlongfolder/anotherfolder/even_longer/and_longer',
        filename: 'longlong_long_shape_name_why_not_but_more_than_this',
        lastEditDate: '2021-05-18T16:02:16Z',
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any
