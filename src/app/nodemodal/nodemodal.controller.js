(function () {
  'use strict';

  angular
    .module('microServicesGui')
    .controller('NodeModalController', NodeModalController);

  function NodeModalController($scope, $filter, GraphService, NodeService, $modalInstance, SetService) {

    $scope.newNode = NodeService.getNode();
    if ($scope.newNode === undefined) {
      $scope.newNode = {};
      $scope.newNode.details = {};
    }
    $scope.newNode.linkedNodes = [];

    $scope.nodesList = {
      placeholder: "node-placeholder",
      connectWith: ".links-container"
    };

    $scope.states = GraphService.getStates();
    $scope.types = GraphService.getTypes();
    $scope.groups = GraphService.getGroups();
    $scope.availableNodes = [];
    GraphService.getGraph().then(function (result) {
      $scope.nodes = result.data;
      searchLinkedNodes();
    });

    $scope.ok = function() {
      $modalInstance.close($scope.newNode);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    function searchLinkedNodes() {
      //Add the nodes to the links
      $scope.nodes.nodes.forEach(function(node, i) {
        node.index = i;
        $scope.availableNodes.push(node);
        $scope.nodes.links.forEach(function (d) {
          if (d.source === node.index) {
            d.source = node;
          }
          if (d.target === node.index) {
            d.target = node;
          }
        });
      });

      //Search for the nodes connected by the link
      $scope.nodes.links.forEach(function(link) {
        if (link.source.id === $scope.newNode.id) {
          var filteredNodes = $filter("nodeModalFilter")($scope.nodes.nodes, link.target);
          if (filteredNodes.length > 0) {
            nodeFound(filteredNodes[0]);
          }
        } else if (link.target.id === $scope.newNode.id) {
          var filteredNodes = $filter("nodeModalFilter")($scope.nodes.nodes, link.source);
          if (filteredNodes.length > 0) {
            nodeFound(filteredNodes[0]);
          }
        }
      });
    }

    /**
     * When a node is found, add it to the linkedNodes array and remove it from the availableNodes array
     * @param node
     */
    function nodeFound(node) {
      SetService.add(node);
      $scope.newNode.linkedNodes = SetService.values();
      if ($scope.availableNodes.indexOf(node) > -1) {
        $scope.availableNodes.splice($scope.availableNodes.indexOf(node), 1);
      }
    }

  }

})();